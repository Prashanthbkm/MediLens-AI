
package com.medilens.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class MedicalReportResponse {

    private UUID id;
    private String originalFilename;
    private String fileType;
    private Long fileSizeBytes;
    private String processingStatus;

    private String textExtractionStatus;
    private String ocrStatus;
    private String structuredExtractionStatus;
    private String processingError;

    private LocalDateTime uploadedAt;

    public MedicalReportResponse(
            UUID id,
            String originalFilename,
            String fileType,
            Long fileSizeBytes,
            String processingStatus,
            String textExtractionStatus,
            String ocrStatus,
            String structuredExtractionStatus,
            String processingError,
            LocalDateTime uploadedAt) {

        this.id = id;
        this.originalFilename = originalFilename;
        this.fileType = fileType;
        this.fileSizeBytes = fileSizeBytes;
        this.processingStatus = processingStatus;
        this.textExtractionStatus = textExtractionStatus;
        this.ocrStatus = ocrStatus;
        this.structuredExtractionStatus = structuredExtractionStatus;
        this.processingError = processingError;
        this.uploadedAt = uploadedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getFileType() {
        return fileType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public String getTextExtractionStatus() {
        return textExtractionStatus;
    }

    public String getOcrStatus() {
        return ocrStatus;
    }

    public String getStructuredExtractionStatus() {
        return structuredExtractionStatus;
    }

    public String getProcessingError() {
        return processingError;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}
