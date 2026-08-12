package io.clouddesk.files.infrastructure;

import java.time.Clock;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.clouddesk.files.application.DownloadFileService;
import io.clouddesk.files.application.FileStorage;
import io.clouddesk.files.application.ListFileService;
import io.clouddesk.files.application.UploadFileService;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.shared.events.DomainEventPublisher;

@Configuration
@EnableConfigurationProperties(FilesProperties.class)
public class FilesBeanConfig {

    @Bean
    public UploadFileService uploadFileService(FileRepository fileRepository, FileStorage fileStorage, Clock clock,
            FilesProperties filesProperties, DomainEventPublisher domainEventPublisher) {
        return new UploadFileService(fileRepository, fileStorage, clock, filesProperties.maxUploadSizeBytes(),
                domainEventPublisher);
    }

    @Bean
    public ListFileService listFileService(FileRepository fileRepository) {
        return new ListFileService(fileRepository);
    }

    @Bean
    public DownloadFileService downloadFileService(FileRepository fileRepository, FileStorage fileStorage) {
        return new DownloadFileService(fileRepository, fileStorage);
    }

}
