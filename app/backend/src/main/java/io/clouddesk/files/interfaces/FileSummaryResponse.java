package io.clouddesk.files.interfaces;

import java.time.Instant;
import java.util.List;

import io.clouddesk.files.domain.UploadedFile;

public record FileSummaryResponse(
        String id, String displayName, String originalFilename, String category, String visibility,
        List<String> tags, String notes, String ownerName, long sizeBytes, Instant uploadedAt) {
    public static FileSummaryResponse from(UploadedFile file) {
        return new FileSummaryResponse(
                file.id().toString(), file.displayName(), file.originalFilename(),
                file.category().name(), file.visibility().name(), file.tags(), file.notes(),
                file.ownerName(), file.sizeBytes(), file.uploadedAt());
    }
}
