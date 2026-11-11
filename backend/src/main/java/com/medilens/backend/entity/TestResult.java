
package com.medilens.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "test_results")
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private MedicalReport medicalReport;

    @Column(name = "test_name", length = 255, nullable = false)
    private String testName;

    @Column(name = "numeric_value", precision = 12, scale = 4)
    private BigDecimal numericValue;

    @Column(name = "text_value", columnDefinition = "TEXT")
    private String textValue;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;

    @Column(name = "result_flag", length = 20)
    private String resultFlag;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Original extracted values: retained for audit purposes.
    @Column(name = "original_test_name", length = 255)
    private String originalTestName;

    @Column(name = "original_numeric_value", precision = 12, scale = 4)
    private BigDecimal originalNumericValue;

    @Column(name = "original_text_value", columnDefinition = "TEXT")
    private String originalTextValue;

    @Column(name = "original_unit", length = 50)
    private String originalUnit;

    @Column(name = "original_reference_range", length = 100)
    private String originalReferenceRange;

    @Column(name = "original_result_flag", length = 20)
    private String originalResultFlag;

    @Column(name = "manually_reviewed", nullable = false)
    private boolean manuallyReviewed = false;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public TestResult() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public MedicalReport getMedicalReport() {
        return medicalReport;
    }

    public void setMedicalReport(MedicalReport medicalReport) {
        this.medicalReport = medicalReport;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public BigDecimal getNumericValue() {
        return numericValue;
    }

    public void setNumericValue(BigDecimal numericValue) {
        this.numericValue = numericValue;
    }

    public String getTextValue() {
        return textValue;
    }

    public void setTextValue(String textValue) {
        this.textValue = textValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getReferenceRange() {
        return referenceRange;
    }

    public void setReferenceRange(String referenceRange) {
        this.referenceRange = referenceRange;
    }

    public String getResultFlag() {
        return resultFlag;
    }

    public void setResultFlag(String resultFlag) {
        this.resultFlag = resultFlag;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getOriginalTestName() {
        return originalTestName;
    }

    public void setOriginalTestName(String originalTestName) {
        this.originalTestName = originalTestName;
    }

    public BigDecimal getOriginalNumericValue() {
        return originalNumericValue;
    }

    public void setOriginalNumericValue(BigDecimal originalNumericValue) {
        this.originalNumericValue = originalNumericValue;
    }

    public String getOriginalTextValue() {
        return originalTextValue;
    }

    public void setOriginalTextValue(String originalTextValue) {
        this.originalTextValue = originalTextValue;
    }

    public String getOriginalUnit() {
        return originalUnit;
    }

    public void setOriginalUnit(String originalUnit) {
        this.originalUnit = originalUnit;
    }

    public String getOriginalReferenceRange() {
        return originalReferenceRange;
    }

    public void setOriginalReferenceRange(String originalReferenceRange) {
        this.originalReferenceRange = originalReferenceRange;
    }

    public String getOriginalResultFlag() {
        return originalResultFlag;
    }

    public void setOriginalResultFlag(String originalResultFlag) {
        this.originalResultFlag = originalResultFlag;
    }

    public boolean isManuallyReviewed() {
        return manuallyReviewed;
    }

    public void setManuallyReviewed(boolean manuallyReviewed) {
        this.manuallyReviewed = manuallyReviewed;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
