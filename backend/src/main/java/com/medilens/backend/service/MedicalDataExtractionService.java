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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MedicalDataExtractionService {

    private final MedicalReportRepository reportRepository;
    private final TestResultRepository testResultRepository;

    private static final BigDecimal MAX_VALUE =
            new BigDecimal("100000000");

    private static final Pattern NUMBER = Pattern.compile(
            "[+-]?\\d+(?:\\.\\d+)?"
    );

    private static final Pattern RANGE = Pattern.compile(
            "([+-]?\\d+(?:\\.\\d+)?)\\s*" +
            "(?:-|–|—|to)\\s*" +
            "([+-]?\\d+(?:\\.\\d+)?)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern NUMERIC_ROW = Pattern.compile(
            "^\\s*([A-Za-z][A-Za-z0-9 ()/%.,&\\_-]*?)" +
            "\\s*[:：]?\\s+" +
            "([+-]?\\d+(?:\\.\\d+)?)" +
            "(?:\\s+(High|Low|Borderline|Normal|Critical))?" +
            "(?:\\s+([+-]?\\d+(?:\\.\\d+)?\\s*" +
            "(?:-|–|—|to)\\s*" +
            "[+-]?\\d+(?:\\.\\d+)?))?" +
            "(?:\\s+([A-Za-zµμ/%][A-Za-zµμ/%0-9.^\\_-]*))?" +
            "\\s*$",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern QUALITATIVE_ROW = Pattern.compile(
            "^\\s*([A-Za-z][A-Za-z0-9 ()/.,&\\_-]*?)" +
            "\\s*[:：]?\\s+" +
            "(Not\\s+Detected|Non[- ]?Reactive|" +
            "Positive|Negative|Reactive|Detected|" +
            "Present|Absent)" +
            "\\s*$",
            Pattern.CASE_INSENSITIVE
    );

    public MedicalDataExtractionService(
            MedicalReportRepository reportRepository,
            TestResultRepository testResultRepository) {

        this.reportRepository = reportRepository;
        this.testResultRepository = testResultRepository;
    }

    @Transactional
    public List<TestResult> extractAndSaveResults(
            UUID reportId, UUID userId) {

        MedicalReport report = reportRepository
                .findByIdAndUserId(reportId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Medical report not found"
                ));

        String text = report.getExtractedText();

        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No extracted text available"
            );
        }

        List<TestResult> extractedResults =
                parseMedicalResults(text, report);

        if (extractedResults.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "No recognizable medical test results found"
            );
        }

        // Load existing results before refreshing the extraction.
        List<TestResult> existingResults =
                testResultRepository.findByMedicalReportId(reportId);

        // Keep all results that the user has manually reviewed.
        List<TestResult> reviewedResults = existingResults.stream()
                .filter(TestResult::isManuallyReviewed)
                .toList();

        // Build a set of reviewed test names to prevent duplicate rows.
        Set<String> reviewedNames = new HashSet<>();

        for (TestResult reviewed : reviewedResults) {
            addNormalizedName(reviewedNames, reviewed.getTestName());
            addNormalizedName(
                    reviewedNames,
                    reviewed.getOriginalTestName()
            );
        }

        // Do not create a fresh extracted row for a manually reviewed test.
        List<TestResult> resultsToSave = extractedResults.stream()
                .filter(result -> !reviewedNames.contains(
                        normalizeName(result.getTestName())
                ))
                .toList();

        // Delete only old unreviewed rows. Reviewed rows remain untouched.
        List<TestResult> unreviewedResults = existingResults.stream()
                .filter(result -> !result.isManuallyReviewed())
                .toList();

        if (!unreviewedResults.isEmpty()) {
            testResultRepository.deleteAll(unreviewedResults);
        }

        // Save newly extracted results.
        List<TestResult> savedResults = resultsToSave.isEmpty()
                ? new ArrayList<>()
                : testResultRepository.saveAll(resultsToSave);

        // Return both preserved reviewed results and fresh extraction results.
        List<TestResult> finalResults = new ArrayList<>(reviewedResults);
        finalResults.addAll(savedResults);

        // ✅ FIX: Update the report status so the frontend stops polling
        report.setStructuredExtractionStatus("COMPLETED");
        report.setProcessingStatus("COMPLETED");
        report.setProcessingError(null);
        reportRepository.save(report);

        return finalResults;
    }

    private void addNormalizedName(Set<String> names, String name) {
        String normalized = normalizeName(name);

        if (!normalized.isBlank()) {
            names.add(normalized);
        }
    }

    private String normalizeName(String name) {
        if (name == null) {
            return "";
        }

        return name.trim().replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    private List<TestResult> parseMedicalResults(
            String text, MedicalReport report) {

        List<TestResult> results = new ArrayList<>();

        String[] lines = text.split("\\R");

        for (String originalLine : lines) {

            String line = originalLine
                    .replace('\t', ' ')
                    .replaceAll("\\s+", " ")
                    .trim();

            if (line.isEmpty()) {
                continue;
            }

            if (isMetadataLine(line)) {
                continue;
            }

            Matcher numericMatcher = NUMERIC_ROW.matcher(line);

            if (numericMatcher.matches()) {

                String testName = numericMatcher.group(1).trim();
                String value = numericMatcher.group(2).trim();
                String reportedFlag = numericMatcher.group(3);
                String referenceRange = numericMatcher.group(4);
                String unit = numericMatcher.group(5);

                // A numerical result must have supporting context.
                if (referenceRange == null && unit == null) {
                    continue;
                }

                if (!isValidTestName(testName)) {
                    continue;
                }

                BigDecimal numericValue = new BigDecimal(value);

                // Protect PostgreSQL NUMERIC(12,4).
                if (numericValue.abs().compareTo(MAX_VALUE) >= 0) {
                    continue;
                }

                String resultFlag = determineResultFlag(
                        numericValue,
                        referenceRange,
                        reportedFlag
                );

                TestResult result = new TestResult();
                result.setMedicalReport(report);
                result.setTestName(testName);
                result.setNumericValue(numericValue);
                result.setTextValue(null);
                result.setUnit(unit);
                result.setReferenceRange(referenceRange);
                result.setResultFlag(resultFlag);

                results.add(result);
                continue;
            }

            Matcher qualitativeMatcher =
                    QUALITATIVE_ROW.matcher(line);

            if (qualitativeMatcher.matches()) {

                String testName =
                        qualitativeMatcher.group(1).trim();

                if (!isValidTestName(testName)) {
                    continue;
                }

                String textValue =
                        qualitativeMatcher.group(2).trim();

                TestResult result = new TestResult();
                result.setMedicalReport(report);
                result.setTestName(testName);
                result.setNumericValue(null);
                result.setTextValue(textValue);
                result.setUnit(null);
                result.setReferenceRange(null);
                result.setResultFlag("UNCLASSIFIED");

                results.add(result);
            }
        }

        return results;
    }

    private String determineResultFlag(
            BigDecimal value,
            String referenceRange,
            String reportedFlag) {

        // Preserve the laboratory's explicitly reported flag.
        if (reportedFlag != null) {

            String flag = reportedFlag.toUpperCase(Locale.ROOT);

            if (flag.equals("HIGH") ||
                    flag.equals("LOW") ||
                    flag.equals("BORDERLINE") ||
                    flag.equals("CRITICAL")) {
                return flag;
            }
        }

        if (referenceRange == null) {
            return "UNCLASSIFIED";
        }

        Matcher matcher = RANGE.matcher(referenceRange);

        if (!matcher.find()) {
            return "UNCLASSIFIED";
        }

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
    }

    private boolean isValidTestName(String testName) {

        if (testName == null ||
                testName.isBlank() ||
                testName.length() > 255) {
            return false;
        }

        String normalized = testName.toLowerCase(Locale.ROOT);

        String[] excluded = {
                "age", "sex", "gender", "pid",
                "patient id", "phone", "mobile",
                "sample", "registered", "collected",
                "reported", "generated", "page",
                "address", "email", "website",
                "instrument", "pathologist",
                "technician", "reference value",
                "reference range", "investigation",
                "result", "unit", "blood indices",
                "complete blood count"
        };

        for (String word : excluded) {
            if (normalized.equals(word) ||
                    normalized.startsWith(word + " ")) {
                return false;
            }
        }

        return true;
    }

    private boolean isMetadataLine(String line) {

        String normalized = line.toLowerCase(Locale.ROOT);

        return normalized.startsWith("dr.") ||
                normalized.startsWith("dr ") ||
                normalized.startsWith("smart pathology") ||
                normalized.startsWith("drlogy") ||
                normalized.startsWith("instruments:") ||
                normalized.startsWith("interpretation:") ||
                normalized.startsWith("thanks for reference") ||
                normalized.startsWith("generated on") ||
                normalized.startsWith("registered on") ||
                normalized.startsWith("collected on") ||
                normalized.startsWith("reported on") ||
                normalized.startsWith("sample collection");
    }
}