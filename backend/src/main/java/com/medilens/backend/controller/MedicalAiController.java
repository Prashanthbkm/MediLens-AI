
package com.medilens.backend.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.medilens.backend.entity.User;
import com.medilens.backend.service.MedicalAiClient;
import com.medilens.backend.service.ReportService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/reports/{id}/ai")
public class MedicalAiController {

    private final MedicalAiClient medicalAiClient;
    private final ReportService reportService;

    public MedicalAiController(
            MedicalAiClient medicalAiClient,
            ReportService reportService) {

        this.medicalAiClient = medicalAiClient;
        this.reportService = reportService;
    }

    // Request DTO for report-based questions
    public record AskQuestionRequest(

            @NotBlank(message = "Question is required")
            @Size(min = 3, max = 1000)
            String question) {
    }

    // Request DTO for individual medical test explanations
    public record ExplainTestRequest(

            @NotBlank(message = "Test name is required")
            String test_name,

            Double numeric_value,

            String text_value,

            String unit,

            String reference_range,

            @NotBlank(message = "Result flag is required")
            String result_flag) {
    }

    // Get authenticated user ID
    private UUID getAuthenticatedUserId(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User authentication required"
            );
        }

        User user = (User) authentication.getPrincipal();

        return user.getId();
    }

    // Build request body while allowing null values
    private Map<String, Object> buildExplanationRequest(
            ExplainTestRequest request) {

        Map<String, Object> requestBody = new LinkedHashMap<>();

        requestBody.put("test_name", request.test_name());
        requestBody.put("numeric_value", request.numeric_value());
        requestBody.put("text_value", request.text_value());
        requestBody.put("unit", request.unit());
        requestBody.put("reference_range", request.reference_range());
        requestBody.put("result_flag", request.result_flag());

        return requestBody;
    }

    // 1. Generate medical report summary
    @PostMapping("/summary")
    public ResponseEntity<Map<String, Object>> summarizeReport(
            @PathVariable UUID id,
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        String reportText = reportService.getExtractedText(id, userId);

        Map<String, Object> result =
                medicalAiClient.summarizeReport(reportText);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    // 2. Index medical report into vector database
    @PostMapping("/index")
    public ResponseEntity<Map<String, Object>> indexReport(
            @PathVariable UUID id,
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        String reportText = reportService.getExtractedText(id, userId);

        Map<String, Object> result =
                medicalAiClient.indexReport(id, userId, reportText);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    // 3. Ask questions about an uploaded medical report
    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askReportQuestion(
            @PathVariable UUID id,
            @Valid @RequestBody AskQuestionRequest request,
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        // Verify report ownership
        reportService.getReportById(id, userId);

        Map<String, Object> result =
                medicalAiClient.askReportQuestion(
                        id,
                        userId,
                        request.question()
                );

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    // 4. Generate rule-based individual test explanation
    @PostMapping("/explain-result")
    public ResponseEntity<Map<String, Object>> explainTestResult(
            @PathVariable UUID id,
            @Valid @RequestBody ExplainTestRequest request,
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        // Verify report ownership
        reportService.getReportById(id, userId);

        Map<String, Object> requestBody =
                buildExplanationRequest(request);

        Map<String, Object> result =
                medicalAiClient.explainTestResult(requestBody);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    // 5. Generate AI-powered individual test explanation using Groq
    @PostMapping("/ai-explain-result")
    public ResponseEntity<Map<String, Object>> aiExplainTestResult(
            @PathVariable UUID id,
            @Valid @RequestBody ExplainTestRequest request,
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        // Verify report ownership
        reportService.getReportById(id, userId);

        Map<String, Object> requestBody =
                buildExplanationRequest(request);

        Map<String, Object> result =
                medicalAiClient.aiExplainTestResult(requestBody);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }
}
