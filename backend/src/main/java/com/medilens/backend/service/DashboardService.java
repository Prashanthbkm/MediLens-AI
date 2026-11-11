package com.medilens.backend.service;


import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medilens.backend.dto.DashboardStatsResponse;
import com.medilens.backend.dto.DashboardStatsResponse.RecentReport;
import com.medilens.backend.entity.MedicalReport;
import com.medilens.backend.repository.MedicalReportRepository;
import com.medilens.backend.repository.TestResultRepository;

@Service
public class DashboardService {

    private final MedicalReportRepository reportRepository;
    private final TestResultRepository testResultRepository;

    public DashboardService(
            MedicalReportRepository reportRepository,
            TestResultRepository testResultRepository) {

        this.reportRepository = reportRepository;
        this.testResultRepository = testResultRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(UUID userId) {

        long totalReports =
                reportRepository.countByUserId(userId);

        long totalTests =
                testResultRepository.countByMedicalReport_UserId(userId);

        long normalResults =
                testResultRepository.countByMedicalReport_UserIdAndResultFlag(
                        userId, "NORMAL"
                );

        long abnormalResults =
                testResultRepository.countByMedicalReport_UserIdAndResultFlagIn(
                        userId,
                        List.of("HIGH", "LOW", "BORDERLINE", "CRITICAL")
                );

        long unclassifiedResults =
                testResultRepository.countByMedicalReport_UserIdAndResultFlag(
                        userId, "UNCLASSIFIED"
                );

        List<RecentReport> recentReports =
                reportRepository
                        .findTop5ByUserIdOrderByUploadedAtDesc(userId)
                        .stream()
                        .map(report -> new RecentReport(
                                report.getId(),
                                report.getOriginalFilename(),
                                report.getProcessingStatus(),
                                report.getUploadedAt()
                        ))
                        .toList();

        return new DashboardStatsResponse(
                totalReports,
                totalTests,
                normalResults,
                abnormalResults,
                unclassifiedResults,
                recentReports
        );
    }
}
