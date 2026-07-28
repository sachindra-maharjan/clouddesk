package io.clouddesk.files.application;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.UploadedFile;

public class UploadFileService {

    private final FileRepository fileRepository;
    private final FileStorage fileStorage;
    private final Clock clock;
    private final long maxUploadByteSize;

    public UploadFileService(FileRepository fileRepository, FileStorage fileStorage, Clock clock,
            long maxUploadByteSize) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
        this.clock = clock;
        this.maxUploadByteSize = maxUploadByteSize;
    }

    public UploadedFile upload(UploadFileCommand command) {
        validate(command);

        StoredFile storedFile = fileStorage.store(command.content(), command.originalFilename());

        UploadedFile file = new UploadedFile(
                UUID.randomUUID(), command.ownerId(), command.ownerName(), command.displayName(),
                command.originalFilename(), command.contentType(), storedFile.sizeBytes(), storedFile.storedPath(),
                command.category(), command.visibility(),
                command.tags() == null ? List.of() : command.tags(),
                command.notes() == null ? "" : command.notes(),
                Instant.now(clock));

        return fileRepository.save(file);
    }

    private void validate(UploadFileCommand command) {
        if (command.displayName() == null || command.displayName().isBlank()) {
            throw new InvalidFileMetadataException("displayName must not be blank.");
        }
        if (command.content() == null || command.content().length == 0) {
            throw new InvalidFileMetadataException("An empty file cannot be uploaded.");
        }
        if (command.content().length > maxUploadByteSize) {
            throw new InvalidFileMetadataException("File exceeds the 25 MB upload limit.");
        }
    }

}
