package com.medilens.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReportUploadResponse {

    private UUID reportId;
    private String filename;
    private String status;
    private String message;
    private LocalDateTime uploadedAt;

    public ReportUploadResponse(
            UUID reportId,
            String filename,
            String status,
            String message,
            LocalDateTime uploadedAt) {

        this.reportId = reportId;
        this.filename = filename;
        this.status = status;
        this.message = message;
        this.uploadedAt = uploadedAt;
    }

    public UUID getReportId() {
        return reportId;
    }

    public String getFilename() {
        return filename;
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}