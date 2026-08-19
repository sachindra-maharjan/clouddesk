package io.clouddesk.dashboard.application;

import static org.junit.Assert.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import io.clouddesk.auth.domain.UserRepository;
import io.clouddesk.dashboard.application.GetDashboardSummaryService;
import io.clouddesk.dashboard.domain.DashboardSummary;
import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.FileVisibility;
import io.clouddesk.files.domain.UploadedFile;

@ExtendWith(MockitoExtension.class)
public class GetDashboardSummaryServiceTest {
    @Mock
    FileRepository fileRepository;
    @Mock
    UserRepository userRepository;

    GetDashboardSummaryService service;

    final Instant fixedNow = Instant.parse("2026-07-27T09:00:00Z");

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(fixedNow, ZoneOffset.UTC);
        service = new GetDashboardSummaryService(fileRepository, userRepository, clock);
    }

    private UploadedFile fileUploadedAt(Instant instant) {
        return new UploadedFile(
                UUID.randomUUID(), UUID.randomUUID(), "Maria Alvarez", "file", "file.txt", "text/plain",
                1024, "path", FileCategory.DOCUMENT, FileVisibility.TEAM, List.of(), "", instant);
    }

    @Test
    void aggregatesCountsFromBothRepositories() {
        when(fileRepository.countAll()).thenReturn(4812L);
        when(fileRepository.sumSizeBytes()).thenReturn(137_856_204_800L);
        when(userRepository.countAll()).thenReturn(5L);
        // Reuses findUploadedSince — the same repository method the
        // storage trend already needed — rather than adding a redundant
        // countUploadedSince to the port for one caller.
        when(fileRepository.findUploadedSince(any())).thenReturn(List.of(
                fileUploadedAt(fixedNow.minus(1, ChronoUnit.DAYS)),
                fileUploadedAt(fixedNow.minus(3, ChronoUnit.DAYS))));

        DashboardSummary summary = service.getSummary();

        assertThat(summary.totalFiles()).isEqualTo(4812L);
        assertThat(summary.totalStorageBytes()).isEqualTo(137_856_204_800L);
        assertThat(summary.activeUsers()).isEqualTo(5L);
        assertThat(summary.filesUploadedThisWeek()).isEqualTo(2L);
    }

    @Test
    void asksTheRepositoryForFilesFromExactlySevenDaysAgo() {
        when(fileRepository.findUploadedSince(any())).thenReturn(List.of());

        service.getSummary();

        verify(fileRepository).findUploadedSince(fixedNow.minus(7, ChronoUnit.DAYS));
    }
}
