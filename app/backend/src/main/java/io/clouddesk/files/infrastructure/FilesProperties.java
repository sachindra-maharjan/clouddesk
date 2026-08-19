package io.clouddesk.files.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("clouddesk.files")
public record FilesProperties(String storageRootDir, long maxUploadSizeBytes) {
}
