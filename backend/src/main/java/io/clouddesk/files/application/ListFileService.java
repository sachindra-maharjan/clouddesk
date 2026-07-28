package io.clouddesk.files.application;

import io.clouddesk.files.domain.FileQuery;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.UploadedFile;
import io.clouddesk.shared.domain.PageResult;

public class ListFileService {
    private final FileRepository fileRepository;

    public ListFileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    public PageResult<UploadedFile> list(FileQuery query) {
        return fileRepository.findPage(query);
    }

}
