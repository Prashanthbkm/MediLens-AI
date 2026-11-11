
package com.medilens.backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.ObjectMapper;

@Service
public class MedicalAiClient {

    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public MedicalAiClient(
            @Value("${medilens.ai.base-url:http://127.0.0.1:8000}")
            String baseUrl,
            ObjectMapper objectMapper) {

        this.baseUrl = baseUrl;
        this.objectMapper = objectMapper;

        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }
    public Map<String, Object> explainTestResult(
            Map<String, Object> requestBody) {

        return post(
                "/api/v1/medical/explain-result",
                requestBody
        );
    }

    public Map<String, Object> aiExplainTestResult(
            Map<String, Object> requestBody) {

        return post(
                "/api/v1/medical/ai-explain-result",
                requestBody
        );
    }

    public Map<String, Object> summarizeReport(String reportText) {
        return post(
                "/api/v1/medical/summarize-report",
                Map.of("report_text", reportText)
        );
    }

    public Map<String, Object> indexReport(
            UUID reportId,
            UUID userId,
            String reportText) {

        return post(
                "/api/v1/medical/ingest-report",
                Map.of(
                        "report_id", reportId.toString(),
                        "user_id", userId.toString(),
                        "report_text", reportText
                )
        );
    }

    public Map<String, Object> askReportQuestion(
            UUID reportId,
            UUID userId,
            String question) {

        return post(
                "/api/v1/medical/ask-report-rag",
                Map.of(
                        "report_id", reportId.toString(),
                        "user_id", userId.toString(),
                        "question", question
                )
        );
    }

    private Map<String, Object> post(
            String path,
            Map<String, Object> requestBody) {

        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);

            System.out.println("========== MEDILENS AI REQUEST ==========");
            System.out.println("URL: " + baseUrl + path);
            System.out.println("Content-Type: application/json");
            System.out.println("HTTP Version: 1.1");
            System.out.println("Request body size: "
                    + jsonBody.getBytes(StandardCharsets.UTF_8).length);
            System.out.println("==========================================");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            jsonBody,
                            StandardCharsets.UTF_8
                    ))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );

            int statusCode = httpResponse.statusCode();
            String responseBody = httpResponse.body();

            System.out.println("========== MEDILENS AI RESPONSE ==========");
            System.out.println("Status: " + statusCode);
            System.out.println("Response: " + responseBody);
            System.out.println("==========================================");

            if (statusCode < 200 || statusCode >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "MediLens AI returned HTTP " + statusCode
                                + ": " + responseBody
                );
            }

            return objectMapper.readValue(responseBody, Map.class);

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "MediLens AI request was interrupted.",
                    exception
            );

        } catch (IOException | IllegalArgumentException exception) {

            exception.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to communicate with MediLens AI.",
                    exception
            );
        }
    }
}
