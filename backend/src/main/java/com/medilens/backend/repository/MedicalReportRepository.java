
package com.medilens.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medilens.backend.entity.MedicalReport;

@Repository
public interface MedicalReportRepository
        extends JpaRepository<MedicalReport, UUID> {

    List<MedicalReport> findAllByUserId(UUID userId);

    Optional<MedicalReport> findByIdAndUserId(
            UUID reportId,
            UUID userId
    );

    long countByUserId(UUID userId);

    List<MedicalReport> findTop5ByUserIdOrderByUploadedAtDesc(
            UUID userId
    );
}
