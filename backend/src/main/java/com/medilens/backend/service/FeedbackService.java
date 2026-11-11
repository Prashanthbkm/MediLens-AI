
package com.medilens.backend.service;

import com.medilens.backend.entity.Feedback;
import com.medilens.backend.repository.FeedbackRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional
    public Feedback submitFeedback(Feedback feedback) {
        feedback.setId(null);
        feedback.setCreatedAt(null);

        return feedbackRepository.save(feedback);
    }
}
