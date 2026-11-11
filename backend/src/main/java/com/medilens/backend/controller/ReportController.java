package com.medilens.backend.controller;

import java.math.BigDecimal;

import java.time.LocalDateTime;

import java.util.List;

import java.util.UUID;

import java.util.stream.Collectors;

import org.springframework.core.io.Resource;

import org.springframework.http.CacheControl;

import org.springframework.http.ContentDisposition;

import org.springframework.http.HttpHeaders;

import org.springframework.http.HttpStatus;

import org.springframework.http.MediaType;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.DeleteMapping;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.PutMapping;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.server.ResponseStatusException;

import com.medilens.backend.dto.MedicalReportResponse;

import com.medilens.backend.dto.ReportUploadResponse;

import com.medilens.backend.entity.TestResult;

import com.medilens.backend.entity.User;

import com.medilens.backend.repository.TestResultRepository;

import com.medilens.backend.service.MedicalDataExtractionService;

import com.medilens.backend.service.ReportService;

import com.medilens.backend.service.TestResultCorrectionService;

@RestController

@RequestMapping("/api/reports")

public class ReportController {

    private final ReportService reportService;

    private final MedicalDataExtractionService extractionService;

    private final TestResultRepository testResultRepository;

    private final TestResultCorrectionService correctionService;

    public ReportController(

            ReportService reportService,

            MedicalDataExtractionService extractionService,

            TestResultRepository testResultRepository,

            TestResultCorrectionService correctionService) {

        this.reportService = reportService;

        this.extractionService = extractionService;

        this.testResultRepository = testResultRepository;

        this.correctionService = correctionService;

    }

    public record TestResultResponse(

            UUID id,

            String testName,

            BigDecimal numericValue,

            String textValue,

            String unit,

            String referenceRange,

            String resultFlag,

            LocalDateTime createdAt,

            String originalTestName,

            boolean manuallyReviewed,

            LocalDateTime reviewedAt) {

    }

    public record TestResultCorrectionRequest(

            String testName,

            BigDecimal numericValue,

            String textValue,

            String unit,

            String referenceRange,

            String resultFlag,

            Boolean criticalConfirmed) {

    }

    private UUID getAuthenticatedUserId(Authentication authentication) {

        if (authentication == null

                || !authentication.isAuthenticated()

                || !(authentication.getPrincipal() instanceof User)) {

            throw new ResponseStatusException(

                    HttpStatus.UNAUTHORIZED,

                    "User authentication required");

        }

        User user = (User) authentication.getPrincipal();

        return user.getId();

    }

    private List<TestResultResponse> convertToResponses(

            List<TestResult> results) {

        return results.stream()

                .map(result -> new TestResultResponse(

                        result.getId(),

                        result.getTestName(),

                        result.getNumericValue(),

                        result.getTextValue(),

                        result.getUnit(),

                        result.getReferenceRange(),

                        result.getResultFlag(),

                        result.getCreatedAt(),

                        result.getOriginalTestName(),

                        result.isManuallyReviewed(),

                        result.getReviewedAt()))

                .collect(Collectors.toList());

    }

    @PostMapping(

            value = "/upload",

            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)

    public ResponseEntity<ReportUploadResponse> uploadReport(

            @RequestParam("file") MultipartFile file,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        ReportUploadResponse response =

                reportService.uploadReport(file, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }

    @GetMapping

    public ResponseEntity<List<MedicalReportResponse>> getAllReports(

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        List<MedicalReportResponse> reports =

                reportService.getAllReports(userId);

        return ResponseEntity.ok(reports);

    }

    @GetMapping("/{id}")

    public ResponseEntity<MedicalReportResponse> getReportById(

            @PathVariable("id") UUID id,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        MedicalReportResponse report =

                reportService.getReportById(id, userId);

        return ResponseEntity.ok(report);

    }

    @GetMapping("/{id}/text")

    public ResponseEntity<String> getExtractedText(

            @PathVariable("id") UUID id,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        String extractedText = reportService.getExtractedText(id, userId);

        return ResponseEntity.ok()

                .contentType(MediaType.TEXT_PLAIN)

                .cacheControl(CacheControl.noStore())

                .body(extractedText);

    }

    @PostMapping("/{id}/extract")

    public ResponseEntity<List<TestResultResponse>> extractResults(

            @PathVariable("id") UUID id,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        List<TestResult> results =

                extractionService.extractAndSaveResults(id, userId);

        return ResponseEntity.ok()

                .cacheControl(CacheControl.noStore())

                .body(convertToResponses(results));

    }

    @GetMapping("/{id}/results")

    public ResponseEntity<List<TestResultResponse>> getTestResults(

            @PathVariable("id") UUID id,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        reportService.getReportById(id, userId);

        List<TestResult> results =

                testResultRepository.findByMedicalReportId(id);

        return ResponseEntity.ok()

                .cacheControl(CacheControl.noStore())

                .body(convertToResponses(results));

    }

    @PutMapping("/{reportId}/results/{resultId}")

    public ResponseEntity<TestResultResponse> saveCorrection(

            @PathVariable("reportId") UUID reportId,

            @PathVariable("resultId") UUID resultId,

            @RequestBody TestResultCorrectionRequest request,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        if (request == null) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Correction request is required");

        }

        TestResult correctedResult = correctionService.saveCorrection(

                reportId,

                resultId,

                userId,

                request.testName(),

                request.numericValue(),

                request.textValue(),

                request.unit(),

                request.referenceRange(),

                request.resultFlag(),

                Boolean.TRUE.equals(request.criticalConfirmed()));

        TestResultResponse response = new TestResultResponse(

                correctedResult.getId(),

                correctedResult.getTestName(),

                correctedResult.getNumericValue(),

                correctedResult.getTextValue(),

                correctedResult.getUnit(),

                correctedResult.getReferenceRange(),

                correctedResult.getResultFlag(),

                correctedResult.getCreatedAt(),

                correctedResult.getOriginalTestName(),

                correctedResult.isManuallyReviewed(),

                correctedResult.getReviewedAt());

        return ResponseEntity.ok()

                .cacheControl(CacheControl.noStore())

                .body(response);

    }

    @GetMapping("/{id}/download")

    public ResponseEntity<Resource> downloadReport(

            @PathVariable("id") UUID id,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        Resource resource = reportService.downloadReport(id, userId);

        String filename = resource.getFilename();

        if (filename == null || filename.isBlank()) {

            filename = "medical-report.pdf";

        }

        return ResponseEntity.ok()

                .contentType(MediaType.APPLICATION_PDF)

                .header(

                        HttpHeaders.CONTENT_DISPOSITION,

                        ContentDisposition.attachment()

                                .filename(filename)

                                .build()

                                .toString())

                .header(HttpHeaders.CACHE_CONTROL, "no-store")

                .body(resource);

    }

    @GetMapping("/{id}/status")

    public ResponseEntity<MedicalReportResponse> getProcessingStatus(

            @PathVariable("id") UUID id,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        MedicalReportResponse report =

                reportService.getReportById(id, userId);

        return ResponseEntity.ok()

                .cacheControl(CacheControl.noStore())

                .body(report);

    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> deleteReport(

            @PathVariable("id") UUID id,

            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        reportService.deleteReport(id, userId);

        return ResponseEntity.noContent().build();

    }

}
