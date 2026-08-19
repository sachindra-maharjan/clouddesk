package io.clouddesk.files.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UploadedFile(
        UUID id, UUID ownerId, String ownerName, String displayName, String originalFilename,
        String contentType, long sizeBytes, String storagePath, FileCategory category,
        FileVisibility visibility, List<String> tags, String notes, Instant uploadedAt) {

    public boolean isVisible(UUID requesterId) {
        return visibility == FileVisibility.TEAM || ownerId.equals(requesterId);
    }

}
