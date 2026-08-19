package io.clouddesk.files.domain;

import java.time.Instant;

public record FileUploadedEvent(String displayName, String ownerName, FileCategory category, long sizeBytes,
                Instant uploadedAt) {

}
