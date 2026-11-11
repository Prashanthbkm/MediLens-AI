
package com.medilens.backend.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "medical_reports")
public class MedicalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "processing_status")
    private String processingStatus = "UPLOADED";

    @Column(name = "text_extraction_status")
    private String textExtractionStatus = "PENDING";

    @Column(name = "ocr_status")
    private String ocrStatus = "NOT_REQUIRED";

    @Column(name = "structured_extraction_status")
    private String structuredExtractionStatus = "PENDING";

    @Column(name = "processing_error", columnDefinition = "TEXT")
    private String processingError;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "storage_path")
    private String storagePath;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }

    public String getTextExtractionStatus() {
        return textExtractionStatus;
    }

    public void setTextExtractionStatus(String textExtractionStatus) {
        this.textExtractionStatus = textExtractionStatus;
    }

    public String getOcrStatus() {
        return ocrStatus;
    }

    public void setOcrStatus(String ocrStatus) {
        this.ocrStatus = ocrStatus;
    }

    public String getStructuredExtractionStatus() {
        return structuredExtractionStatus;
    }

    public void setStructuredExtractionStatus(String structuredExtractionStatus) {
        this.structuredExtractionStatus = structuredExtractionStatus;
    }

    public String getProcessingError() {
        return processingError;
    }

    public void setProcessingError(String processingError) {
        this.processingError = processingError;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }
}
