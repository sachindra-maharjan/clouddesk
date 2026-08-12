package io.clouddesk.files.domain;

import java.util.UUID;

public record FileQuery(UUID requesterId, String search, FileCategory fileCategory, int page, int pageSize,
        FileSortField sortBy, SortDirection sortDir) {

    public FileQuery(UUID requesterId, String search, FileCategory fileCategory, int page, int pageSize) {
        this(requesterId, search, fileCategory, page, pageSize, null, null);
    }
}
