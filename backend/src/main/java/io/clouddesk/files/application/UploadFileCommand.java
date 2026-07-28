package io.clouddesk.files.application;

import java.util.List;
import java.util.UUID;

import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileVisibility;

public record UploadFileCommand(
                UUID ownerId, String ownerName, String displayName, FileCategory category, FileVisibility visibility,
                List<String> tags, String notes, String originalFilename, String contentType, byte[] content) {
}
