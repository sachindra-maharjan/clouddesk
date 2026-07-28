package io.clouddesk.files.interfaces;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.clouddesk.auth.domain.User;
import io.clouddesk.files.application.DownloadFileService;
import io.clouddesk.files.application.FileContent;
import io.clouddesk.files.application.ListFileService;
import io.clouddesk.files.application.UploadFileCommand;
import io.clouddesk.files.application.UploadFileService;
import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileQuery;
import io.clouddesk.files.domain.FileVisibility;
import io.clouddesk.shared.security.CurrentUserResolver;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final UploadFileService uploadFileService;
    private final ListFileService listFilesService;
    private final DownloadFileService downloadFileService;
    private final CurrentUserResolver currentUserResolver;

    public FileController(
            UploadFileService uploadFileService, ListFileService listFilesService,
            DownloadFileService downloadFileService, CurrentUserResolver currentUserResolver) {
        this.uploadFileService = uploadFileService;
        this.listFilesService = listFilesService;
        this.downloadFileService = downloadFileService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FileSummaryResponse upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam String displayName,
            @RequestParam FileCategory category,
            @RequestParam FileVisibility visibility,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) String notes) {
        User currentUser = currentUserResolver.resolve();

        UploadFileCommand command = new UploadFileCommand(
                currentUser.id(), currentUser.fullName(), displayName, category, visibility,
                tags, notes, file.getOriginalFilename(), file.getContentType(), readBytes(file));

        return FileSummaryResponse.from(uploadFileService.upload(command));
    }

    @GetMapping
    public FilePageResponse list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FileCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = currentUserResolver.resolve();
        FileQuery query = new FileQuery(currentUser.id(), search, category, page, size);
        return FilePageResponse.from(listFilesService.list(query));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> download(@PathVariable UUID id) {
        User currentUser = currentUserResolver.resolve();
        FileContent fileContent = downloadFileService.download(id, currentUser.id());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileContent.metadata().contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(fileContent.metadata().originalFilename()).build()
                                .toString())
                .body(new ByteArrayResource(fileContent.content()));
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read uploaded file.", e);
        }
    }

}
