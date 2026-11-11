
package com.medilens.backend.service;

import com.medilens.backend.entity.MedicalReport;
import com.medilens.backend.entity.TestResult;
import com.medilens.backend.repository.MedicalReportRepository;
import com.medilens.backend.repository.TestResultRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TestResultCorrectionService {

    private final MedicalReportRepository reportRepository;
    private final TestResultRepository testResultRepository;

    private static final BigDecimal MAX_VALUE =
            new BigDecimal("100000000");

    private static final Pattern RANGE = Pattern.compile(
            "([+-]?\\d+(?:\\.\\d+)?)\\s*(?:-|–|—|to)\\s*([+-]?\\d+(?:\\.\\d+)?)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Set<String> ALLOWED_FLAGS = Set.of(
            "NORMAL",
            "LOW",
            "HIGH",
            "BORDERLINE",
            "CRITICAL",
            "UNCLASSIFIED"
    );

    public TestResultCorrectionService(
            MedicalReportRepository reportRepository,
            TestResultRepository testResultRepository
    ) {
        this.reportRepository = reportRepository;
        this.testResultRepository = testResultRepository;
    }

    @Transactional
    public TestResult saveCorrection(
            UUID reportId,
            UUID resultId,
            UUID userId,
            String testName,
            BigDecimal numericValue,
            String textValue,
            String unit,
            String referenceRange,
            String requestedResultFlag,
            Boolean criticalConfirmed
    ) {

        MedicalReport report = reportRepository
                .findByIdAndUserId(reportId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Medical report not found"
                ));

        TestResult result = testResultRepository
                .findByIdAndMedicalReportId(resultId, report.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Test result not found"
                ));

        validateFields(
                testName,
                numericValue,
                textValue,
                unit,
                referenceRange
        );

        // Preserve original extraction only on the first review.
        if (!result.isManuallyReviewed()) {
            result.setOriginalTestName(result.getTestName());
            result.setOriginalNumericValue(result.getNumericValue());
            result.setOriginalTextValue(result.getTextValue());
            result.setOriginalUnit(result.getUnit());
            result.setOriginalReferenceRange(result.getReferenceRange());
            result.setOriginalResultFlag(result.getResultFlag());
        }

        result.setTestName(testName.trim());
        result.setNumericValue(numericValue);
        result.setTextValue(normalize(textValue));
        result.setUnit(normalize(unit));
        result.setReferenceRange(normalize(referenceRange));

        result.setResultFlag(resolveResultFlag(
                numericValue,
                referenceRange,
                requestedResultFlag,
                criticalConfirmed
        ));

        result.setManuallyReviewed(true);
        result.setReviewedAt(LocalDateTime.now());

        return testResultRepository.save(result);
    }

    private String resolveResultFlag(
            BigDecimal value,
            String range,
            String requestedFlag,
            Boolean criticalConfirmed
    ) {

        if (requestedFlag == null || requestedFlag.isBlank()) {
            return determineResultFlag(value, range);
        }

        String flag = requestedFlag.trim().toUpperCase(Locale.ROOT);

        if (!ALLOWED_FLAGS.contains(flag)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported result flag"
            );
        }

        if ("CRITICAL".equals(flag)
                && !Boolean.TRUE.equals(criticalConfirmed)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "CRITICAL requires confirmation that the laboratory report explicitly marks this result as critical"
            );
        }

        return flag;
    }

    private void validateFields(
            String testName,
            BigDecimal numericValue,
            String textValue,
            String unit,
            String referenceRange
    ) {

        if (testName == null || testName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Test name is required"
            );
        }

        if (testName.trim().length() > 255) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Test name cannot exceed 255 characters"
            );
        }

        if (unit != null && unit.trim().length() > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit cannot exceed 50 characters"
            );
        }

        if (referenceRange != null
                && referenceRange.trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reference range cannot exceed 100 characters"
            );
        }

        if (numericValue != null
                && textValue != null
                && !textValue.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide either a numeric value or a text value, not both"
            );
        }

        if (numericValue == null
                && (textValue == null || textValue.isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A numeric or text result value is required"
            );
        }

        if (numericValue != null) {

            if (numericValue.abs().compareTo(MAX_VALUE) >= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Numeric value exceeds the supported limit"
                );
            }

            if (numericValue.scale() > 4
                    || numericValue.precision() > 12) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Numeric value supports up to 4 decimal places and 12 digits"
                );
            }
        }
    }

    private String determineResultFlag(
            BigDecimal value,
            String referenceRange
    ) {

        if (value == null
                || referenceRange == null
                || referenceRange.isBlank()) {
            return "UNCLASSIFIED";
        }

        Matcher matcher = RANGE.matcher(referenceRange);

        if (!matcher.find()) {
            return "UNCLASSIFIED";
        }

        try {
            BigDecimal minimum = new BigDecimal(matcher.group(1));
            BigDecimal maximum = new BigDecimal(matcher.group(2));

            if (minimum.compareTo(maximum) > 0) {
                return "UNCLASSIFIED";
            }

            if (value.compareTo(minimum) < 0) {
                return "LOW";
            }

            if (value.compareTo(maximum) > 0) {
                return "HIGH";
            }

            return "NORMAL";

        } catch (NumberFormatException exception) {
            return "UNCLASSIFIED";
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }
}
