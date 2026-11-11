
package com.medilens.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.medilens.backend.entity.TestResult;

@Repository
public interface TestResultRepository
        extends JpaRepository<TestResult, UUID> {

    List<TestResult> findByMedicalReportId(UUID reportId);

    Optional<TestResult> findByIdAndMedicalReportId(
            UUID resultId,
            UUID reportId
    );

    List<TestResult> findByMedicalReportIdAndResultFlag(
            UUID reportId,
            String resultFlag
    );

    void deleteByMedicalReportId(UUID reportId);

    long countByMedicalReport_UserId(UUID userId);

    long countByMedicalReport_UserIdAndResultFlag(
            UUID userId,
            String resultFlag
    );

    long countByMedicalReport_UserIdAndResultFlagIn(
            UUID userId,
            List<String> resultFlags
    );
}
