package io.clouddesk.dashboard.application;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import org.junit.jupiter.api.Test;

import io.clouddesk.dashboard.domain.StorageTrendPoint;
import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileVisibility;
import io.clouddesk.files.domain.UploadedFile;

public class GetStorageTrendServiceTest {

        private static UploadedFile fileUploadedAt(String isoInstant, long sizeBytes) {
                return new UploadedFile(
                                UUID.randomUUID(), UUID.randomUUID(), "Maria Alvarez", "file", "file.txt", "text/plain",
                                sizeBytes, "path", FileCategory.DOCUMENT, FileVisibility.TEAM, List.of(), "",
                                Instant.parse(isoInstant));
        }

        @Test
        void returnsOnePointPerDayInRangeEvenWithNoFiles() {
                LocalDate start = LocalDate.of(2026, 7, 1);
                LocalDate end = LocalDate.of(2026, 7, 5);

                List<StorageTrendPoint> points = GetStorageTrendService.computeCumulativeTrend(
                                List.of(), start, end, ZoneOffset.UTC);

                assertThat(points).extracting(StorageTrendPoint::date)
                                .containsExactly(
                                                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 2),
                                                LocalDate.of(2026, 7, 3),
                                                LocalDate.of(2026, 7, 4), LocalDate.of(2026, 7, 5));
                assertThat(points).extracting(StorageTrendPoint::cumulativeBytes).containsOnly(0L);
        }

        @Test
        void aFilesBytesCarryForwardOnEveryDayFromItsUploadDayOnward() {
                LocalDate start = LocalDate.of(2026, 7, 1);
                LocalDate end = LocalDate.of(2026, 7, 4);
                List<UploadedFile> files = List.of(fileUploadedAt("2026-07-02T10:00:00Z", 1000));

                List<StorageTrendPoint> points = GetStorageTrendService.computeCumulativeTrend(files, start, end,
                                ZoneOffset.UTC);

                assertThat(points).extracting(StorageTrendPoint::date, StorageTrendPoint::cumulativeBytes)
                                .containsExactly(
                                                tuple(LocalDate.of(2026, 7, 1), 0L),
                                                tuple(LocalDate.of(2026, 7, 2), 1000L),
                                                tuple(LocalDate.of(2026, 7, 3), 1000L),
                                                tuple(LocalDate.of(2026, 7, 4), 1000L));
        }

        @Test
        void sumsMultipleFilesUploadedOnTheSameDayIntoOneDaysDelta() {
                LocalDate start = LocalDate.of(2026, 7, 1);
                LocalDate end = LocalDate.of(2026, 7, 2);
                List<UploadedFile> files = List.of(
                                fileUploadedAt("2026-07-01T08:00:00Z", 500),
                                fileUploadedAt("2026-07-01T20:00:00Z", 700));

                List<StorageTrendPoint> points = GetStorageTrendService.computeCumulativeTrend(files, start, end,
                                ZoneOffset.UTC);

                assertThat(points).extracting(StorageTrendPoint::cumulativeBytes).containsExactly(1200L, 1200L);
        }

        @Test
        void groupsPurelyByCalendarDateIgnoringTimeOfDay() {
                LocalDate start = LocalDate.of(2026, 7, 1);
                LocalDate end = LocalDate.of(2026, 7, 1);
                List<UploadedFile> files = List.of(
                                fileUploadedAt("2026-07-01T00:00:01Z", 100),
                                fileUploadedAt("2026-07-01T23:59:59Z", 200));

                List<StorageTrendPoint> points = GetStorageTrendService.computeCumulativeTrend(files, start, end,
                                ZoneOffset.UTC);

                assertThat(points).extracting(StorageTrendPoint::cumulativeBytes).containsExactly(300L);
        }

        @Test
        void aSingleDayRangeReturnsExactlyOnePoint() {
                LocalDate onlyDay = LocalDate.of(2026, 7, 1);

                List<StorageTrendPoint> points = GetStorageTrendService.computeCumulativeTrend(
                                List.of(), onlyDay, onlyDay, ZoneOffset.UTC);

                assertThat(points).hasSize(1);
                assertThat(points.get(0).date()).isEqualTo(onlyDay);
        }

}
