package io.clouddesk.dashboard.domain;

public record DashboardSummary(long totalFiles, long totalStorageBytes, long activeUsers, long filesUploadedThisWeek) {
}
