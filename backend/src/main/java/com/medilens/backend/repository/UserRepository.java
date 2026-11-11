package com.medilens.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medilens.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Find user using email
    Optional<User> findByEmail(String email);

    // Check whether email already exists
    boolean existsByEmail(String email);
}
