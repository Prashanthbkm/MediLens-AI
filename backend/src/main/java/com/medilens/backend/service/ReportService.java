
package com.medilens.backend.service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.medilens.backend.dto.MedicalReportResponse;
import com.medilens.backend.dto.ReportUploadResponse;
import com.medilens.backend.entity.MedicalReport;
import com.medilens.backend.repository.MedicalReportRepository;
import com.medilens.backend.util.FileStorageUtil;

@Service
public class ReportService {

    private final MedicalReportRepository reportRepository;
    private final FileStorageUtil fileStorageUtil;
    private final Tesseract tesseract;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final int MAX_PDF_PAGES = 50;
    private static final float OCR_DPI = 200;

    private static final byte[] PDF_SIGNATURE =
            "%PDF-".getBytes(StandardCharsets.US_ASCII);

    public ReportService(
            MedicalReportRepository reportRepository,
            FileStorageUtil fileStorageUtil,
            Tesseract tesseract) {

        this.reportRepository = reportRepository;
        this.fileStorageUtil = fileStorageUtil;
        this.tesseract = tesseract;
    }

    // Upload PDF, extract normal text and perform OCR if required
    @Transactional
    public ReportUploadResponse uploadReport(
            MultipartFile file,
            UUID userId) {

        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User authentication required"
            );
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select a PDF file"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File size must not exceed 10 MB"
            );
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null ||
                !originalFilename.toLowerCase().endsWith(".pdf")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PDF files are allowed"
            );
        }

        String contentType = file.getContentType();

        if (contentType != null &&
                !contentType.equalsIgnoreCase("application/pdf") &&
                !contentType.equalsIgnoreCase("application/octet-stream")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid PDF content type"
            );
        }

        byte[] pdfBytes;

        try {
            pdfBytes = file.getBytes();

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Could not read uploaded file",
                    exception
            );
        }

        // Validate PDF signature
        if (pdfBytes.length < PDF_SIGNATURE.length ||
                !Arrays.equals(
                        Arrays.copyOf(pdfBytes, PDF_SIGNATURE.length),
                        PDF_SIGNATURE)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid PDF file content"
            );
        }

        String extractedText = null;
        String processingStatus;

        String textExtractionStatus = "PENDING";
        String ocrStatus = "PENDING";
        String structuredExtractionStatus = "PENDING";
        String processingError = null;

        // Validate PDF structure and extract text
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {

            int pageCount = document.getNumberOfPages();

            if (pageCount == 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "PDF contains no pages"
                );
            }

            if (pageCount > MAX_PDF_PAGES) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "PDF cannot contain more than 50 pages"
                );
            }

            // Stage 1: Digital PDF text extraction
            try {
                PDFTextStripper textStripper = new PDFTextStripper();
                extractedText = textStripper.getText(document).trim();
                textExtractionStatus = "COMPLETED";

            } catch (IOException exception) {
                textExtractionStatus = "FAILED";
                throw exception;
            }

            if (extractedText.isBlank()) {

                // Stage 2: OCR for scanned PDFs
                extractedText = null;

                try {
                    String ocrText = extractTextUsingOCR(document);

                    if (ocrText == null || ocrText.isBlank()) {
                        ocrStatus = "FAILED";
                        processingStatus = "OCR_REQUIRED";
                        processingError =
                                "OCR did not detect readable text in the PDF.";

                    } else {
                        extractedText = ocrText;
                        ocrStatus = "COMPLETED";
                        processingStatus = "EXTRACTED";
                    }

                } catch (TesseractException exception) {
                    extractedText = null;
                    ocrStatus = "FAILED";
                    processingStatus = "OCR_FAILED";
                    processingError =
                            "OCR processing failed: " + exception.getMessage();
                }

            } else {
                // Digital PDF: OCR is not required
                ocrStatus = "SKIPPED";
                processingStatus = "EXTRACTED";
            }

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The PDF is corrupted, encrypted, or could not be processed",
                    exception
            );
        }

        // Generate unique file name
        UUID fileId = UUID.randomUUID();
        String storedFilename = fileId + ".pdf";

        // Store original PDF
        String storagePath =
                fileStorageUtil.storeFile(file, storedFilename);

        // Save report metadata and processing stages
        MedicalReport report = new MedicalReport();

        report.setUserId(userId);
        report.setOriginalFilename(originalFilename);
        report.setFileType("application/pdf");
        report.setFileSizeBytes(file.getSize());
        report.setStoragePath(storagePath);
        report.setExtractedText(extractedText);
        report.setProcessingStatus(processingStatus);

        report.setTextExtractionStatus(textExtractionStatus);
        report.setOcrStatus(ocrStatus);
        report.setStructuredExtractionStatus(structuredExtractionStatus);
        report.setProcessingError(processingError);

        MedicalReport savedReport = reportRepository.save(report);

        return new ReportUploadResponse(
                savedReport.getId(),
                savedReport.getOriginalFilename(),
                savedReport.getProcessingStatus(),
                "Medical report uploaded successfully",
                savedReport.getUploadedAt()
        );
    }

    // Convert scanned PDF pages into images and extract text using Tesseract
    private String extractTextUsingOCR(PDDocument document)
            throws TesseractException, IOException {

        PDFRenderer pdfRenderer = new PDFRenderer(document);
        StringBuilder extractedText = new StringBuilder();

        synchronized (tesseract) {

            for (int page = 0;
                    page < document.getNumberOfPages();
                    page++) {

                BufferedImage image = pdfRenderer.renderImageWithDPI(
                        page,
                        OCR_DPI,
                        ImageType.RGB
                );

                try {
                    String pageText = tesseract.doOCR(image);

                    if (pageText != null && !pageText.isBlank()) {
                        extractedText.append(pageText.trim());
                        extractedText.append("\n\n");
                    }

                } finally {
                    image.flush();
                }
            }
        }

        return extractedText.toString().trim();
    }

    // Get all reports belonging to a specific user
    @Transactional(readOnly = true)
    public List<MedicalReportResponse> getAllReports(UUID userId) {

        return reportRepository.findAllByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get report only if it belongs to the requesting user
    @Transactional(readOnly = true)
    public MedicalReportResponse getReportById(
            UUID reportId,
            UUID userId) {

        MedicalReport report =
                reportRepository.findByIdAndUserId(reportId, userId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Medical report not found"
                        ));

        return convertToResponse(report);
    }

    // Retrieve extracted text with ownership verification
    @Transactional(readOnly = true)
    public String getExtractedText(UUID reportId, UUID userId) {

        MedicalReport report =
                reportRepository.findByIdAndUserId(reportId, userId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Medical report not found"
                        ));

        if (report.getExtractedText() == null ||
                report.getExtractedText().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Extracted text is not available for this report"
            );
        }

        return report.getExtractedText();
    }

    // Download report only if it belongs to the requesting user
    @Transactional(readOnly = true)
    public Resource downloadReport(
            UUID reportId,
            UUID userId) {

        MedicalReport report =
                reportRepository.findByIdAndUserId(reportId, userId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Medical report not found"
                        ));

        if (report.getStoragePath() == null ||
                report.getStoragePath().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Medical report file not found"
            );
        }

        try {
            return fileStorageUtil.loadFileAsResource(
                    report.getStoragePath()
            );

        } catch (RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Medical report file not found",
                    exception
            );
        }
    }

    // Convert Entity To Response DTO
    private MedicalReportResponse convertToResponse(
            MedicalReport report) {

        return new MedicalReportResponse(
                report.getId(),
                report.getOriginalFilename(),
                report.getFileType(),
                report.getFileSizeBytes(),
                report.getProcessingStatus(),
                report.getTextExtractionStatus(),
                report.getOcrStatus(),
                report.getStructuredExtractionStatus(),
                report.getProcessingError(),
                report.getUploadedAt()
        );
    }

    // Delete report only if it belongs to the requesting user
    @Transactional
    public void deleteReport(UUID reportId, UUID userId) {

        MedicalReport report =
                reportRepository.findByIdAndUserId(reportId, userId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Medical report not found"
                        ));

        fileStorageUtil.deleteFile(report.getStoragePath());
        reportRepository.delete(report);
    }
}
