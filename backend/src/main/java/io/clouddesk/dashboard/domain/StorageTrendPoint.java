package io.clouddesk.dashboard.domain;

import java.time.LocalDate;

public record StorageTrendPoint(LocalDate date, long cumulativeBytes) {

}
