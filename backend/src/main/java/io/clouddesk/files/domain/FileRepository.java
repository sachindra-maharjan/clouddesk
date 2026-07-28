package io.clouddesk.files.domain;

import java.util.Optional;
import java.util.UUID;

import io.clouddesk.shared.domain.PageResult;

public interface FileRepository {

    UploadedFile save(UploadedFile file);

    Optional<UploadedFile> findById(UUID id);

    PageResult<UploadedFile> findPage(FileQuery query);

}
