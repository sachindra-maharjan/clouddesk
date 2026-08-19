package io.clouddesk.dashboard.interfaces;

import io.clouddesk.dashboard.domain.DashboardSummary;

public record DashboardSummaryResponse(long totalFiles, long totalStorageBytes, long activeUsers,
        long filesUploadedThisWeek) {
    public static DashboardSummaryResponse from(DashboardSummary summary) {
        return new DashboardSummaryResponse(
                summary.totalFiles(), summary.totalStorageBytes(), summary.activeUsers(),
                summary.filesUploadedThisWeek());
    }
}
