package io.clouddesk.dashboard.application;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import io.clouddesk.auth.domain.UserRepository;
import io.clouddesk.dashboard.domain.DashboardSummary;
import io.clouddesk.files.domain.FileRepository;

public class GetDashboardSummaryService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public GetDashboardSummaryService(FileRepository fileRepository, UserRepository userRepository, Clock clock) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    public DashboardSummary getSummary() {
        Instant sevenDaysAgo = Instant.now(clock).minus(7, ChronoUnit.DAYS);
        long uploadedThisWeek = fileRepository.findUploadedSince(sevenDaysAgo).size();

        return new DashboardSummary(
                fileRepository.countAll(), fileRepository.sumSizeBytes(), userRepository.countAll(), uploadedThisWeek);
    }
}
