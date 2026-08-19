package io.clouddesk.dashboard.application;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.clouddesk.dashboard.domain.StorageTrendPoint;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.UploadedFile;

public class GetStorageTrendService {

    private final FileRepository fileRepository;
    private final Clock clock;

    public GetStorageTrendService(FileRepository fileRepository, Clock clock) {
        this.fileRepository = fileRepository;
        this.clock = clock;
    }

    public List<StorageTrendPoint> getTrend(int days) {
        LocalDate today = LocalDate.now(clock);
        LocalDate startDate = today.minusDays(days - 1L);
        Instant since = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();

        List<UploadedFile> files = fileRepository.findUploadedSince(since);
        return computeCumulativeTrend(files, startDate, today, ZoneOffset.UTC);
    }

    public static List<StorageTrendPoint> computeCumulativeTrend(List<UploadedFile> files, LocalDate start,
            LocalDate end,
            ZoneOffset offset) {

        Map<LocalDate, Long> bytesByDay = files.stream()
                .collect(Collectors.groupingBy(
                        file -> file.uploadedAt().atZone(offset).toLocalDate(),
                        Collectors.summingLong(file -> file.sizeBytes())));

        List<StorageTrendPoint> points = new ArrayList<>();
        long cumulative = 0;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            cumulative += bytesByDay.getOrDefault(date, 0L);
            points.add(new StorageTrendPoint(date, cumulative));
        }
        return points;
    }
}
