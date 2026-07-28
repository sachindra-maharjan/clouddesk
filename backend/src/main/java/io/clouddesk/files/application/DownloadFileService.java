package io.clouddesk.files.application;

import java.util.UUID;

import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.UploadedFile;

public class DownloadFileService {

    private final FileRepository fileRepository;
    private final FileStorage fileStorage;

    public DownloadFileService(FileRepository fileRepository, FileStorage fileStorage) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
    }

    public FileContent download(UUID fileId, UUID requesterId) {
        UploadedFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException(fileId));

        if (!file.isVisible(requesterId)) {
            throw new FileAccessDeniedException();
        }

        byte[] content = fileStorage.load(file.storagePath());

        return new FileContent(file, content);
    }

}
