package io.clouddesk.dashboard.domain;

import java.time.LocalDate;

public record StorageTrendPointResponse(LocalDate date, long cumulativeBytes) {
    public static StorageTrendPointResponse from(StorageTrendPoint point) {
        return new StorageTrendPointResponse(point.date(), point.cumulativeBytes());
    }
}
