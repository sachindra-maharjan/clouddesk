package io.clouddesk.dashboard.infrastructure;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.clouddesk.auth.domain.UserRepository;
import io.clouddesk.dashboard.application.GetDashboardSummaryService;
import io.clouddesk.dashboard.application.GetStorageTrendService;
import io.clouddesk.files.domain.FileRepository;

@Configuration
public class DashboardBeansConfig {
    @Bean
    public GetDashboardSummaryService getDashboardSummaryService(
            FileRepository fileRepository, UserRepository userRepository, Clock clock) {
        return new GetDashboardSummaryService(fileRepository, userRepository, clock);
    }

    @Bean
    public GetStorageTrendService getStorageTrendService(FileRepository fileRepository, Clock clock) {
        return new GetStorageTrendService(fileRepository, clock);
    }
}
