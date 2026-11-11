
package com.medilens.backend.controller;

import com.medilens.backend.entity.Feedback;
import com.medilens.backend.service.FeedbackService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitFeedback(
            @Valid @RequestBody Feedback feedback) {

        Feedback savedFeedback = feedbackService.submitFeedback(feedback);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
                "success", true,
                "message", "Feedback submitted successfully",
                "data", savedFeedback
            )
        );
    }
}
