package io.clouddesk.files.interfaces;

import java.util.List;

import io.clouddesk.files.domain.UploadedFile;
import io.clouddesk.shared.domain.PageResult;

public record FilePageResponse(List<FileSummaryResponse> items, int page, int pageSize, long totalItems) {
    public static FilePageResponse from(PageResult<UploadedFile> pageResult) {
        List<FileSummaryResponse> items = pageResult.items().stream().map(FileSummaryResponse::from).toList();
        return new FilePageResponse(items, pageResult.page(), pageResult.pageSize(), pageResult.totalItems());
    }
}
