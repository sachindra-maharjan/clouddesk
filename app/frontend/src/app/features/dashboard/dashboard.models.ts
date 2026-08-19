export interface DashboardSummary {
    totalFiles: number;
    totalStorageBytes: number;
    activeUsers: number;
    filesUploadedThisWeek: number;
}
export interface StorageTrendPoint {
    date: string;
    cumulativeBytes: number;
}

export interface ActivityEvent {
    displayName: string;
    ownerName: string;
    category: string;
    sizeBytes: number;
    uploadedAt: string;
}
