package com.medilens.backend.dto;



import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record DashboardStatsResponse(

        long totalReports,

        long totalTests,

        long normalResults,

        long abnormalResults,

        long unclassifiedResults,

        List<RecentReport> recentReports

) {

    public record RecentReport(
            UUID id,
            String originalFilename,
            String processingStatus,
            LocalDateTime uploadedAt
    ) {
    }
}
