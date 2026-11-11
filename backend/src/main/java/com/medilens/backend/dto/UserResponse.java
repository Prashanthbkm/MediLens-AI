package com.medilens.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserResponse {

    private UUID id;
    private String fullName;
    private String email;
    private LocalDateTime createdAt;

    public UserResponse(
            UUID id,
            String fullName,
            String email,
            LocalDateTime createdAt) {

        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
