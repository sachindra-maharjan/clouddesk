package io.clouddesk.files.application;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.FileVisibility;
import io.clouddesk.files.domain.UploadedFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
public class UploadFileServiceTest {

    private static final long MAX_UPLOAD_SIZE_BYTES = 25L * 1024 * 1024;

    @Mock
    FileRepository fileRepository;
    @Mock
    FileStorage fileStorage;
    UploadFileService uploadFileService;

    final Instant fixedNow = Instant.parse("2026-07-27T09:00:00Z");
    final UUID ownerId = UUID.randomUUID();

    @BeforeEach
    void setup() {
        Clock clock = Clock.fixed(fixedNow, ZoneOffset.UTC);
        uploadFileService = new UploadFileService(fileRepository, fileStorage, clock, MAX_UPLOAD_SIZE_BYTES);
    }

    private UploadFileCommand validCommand(byte[] content) {
        return new UploadFileCommand(
                ownerId, "Maria Alvarez", "Q3 board deck", FileCategory.PRESENTATION, FileVisibility.TEAM,
                List.of("finance", "q3"), "For the board meeting", "board-deck.pptx",
                "application/vnd.ms-powerpoint", content);
    }

    @Test
    void uploadsAValidFileAndReturnsGeneratedId() {
        when(fileStorage.store(any(), any())).thenReturn(new StoredFile("2026/07/abc123-board-deck.pptx", 1024));
        when(fileRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        UploadedFile result = uploadFileService.upload(validCommand(new byte[1024]));

        assertThat(result.id()).isNotNull();
        assertThat(result.displayName()).isEqualTo("Q3 board deck");
        assertThat(result.ownerId()).isEqualTo(ownerId);
        assertThat(result.uploadedAt()).isEqualTo(fixedNow);
    }

    @Test
    void storesBytesBeforePersistingMetadata() {
        when(fileStorage.store(any(), any())).thenReturn(new StoredFile("2026/07/abc123-board-deck.pptx", 1024));
        when(fileRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        UploadedFile file = uploadFileService.upload(validCommand(new byte[1024]));

        verify(fileStorage).store(any(), eq("board-deck.pptx"));
        assertThat(file.storagePath()).isEqualTo("2026/07/abc123-board-deck.pptx");
        assertThat(file.sizeBytes()).isEqualTo(1024);
    }

    @Test
    void rejectABlankDisplayName() {
        UploadFileCommand command = new UploadFileCommand(
                ownerId, "Maria Alvarez", "   ", FileCategory.DOCUMENT, FileVisibility.TEAM,
                List.of(), "", "notes.txt", "text/plain", new byte[10]);

        assertThatThrownBy(() -> uploadFileService.upload(command))
                .isInstanceOf(InvalidFileMetadataException.class)
                .hasMessage("displayName must not be blank.");
    }

    @Test
    void rejectsAnEmptyFile() {
        assertThatThrownBy(() -> uploadFileService.upload(validCommand(new byte[0])))
                .isInstanceOf(InvalidFileMetadataException.class)
                .hasMessage("An empty file cannot be uploaded.");
    }

    @Test
    void rejectsAFileOverTheConfiguredSizeLimit() {
        byte[] tooLarge = new byte[(int) MAX_UPLOAD_SIZE_BYTES + 1];

        assertThatThrownBy(() -> uploadFileService.upload(validCommand(tooLarge)))
                .isInstanceOf(InvalidFileMetadataException.class)
                .hasMessage("File exceeds the 25 MB upload limit.");
    }

    @Test
    void defaultsTagsAndNotesToEmptyWhenNull() {
        when(fileStorage.store(any(), any())).thenReturn(new StoredFile("path", 10));
        when(fileRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        UploadFileCommand command = new UploadFileCommand(
                ownerId, "Maria Alvarez", "Notes", FileCategory.DOCUMENT, FileVisibility.TEAM,
                null, null, "notes.txt", "text/plain", new byte[10]);

        UploadedFile result = uploadFileService.upload(command);

        assertThat(result.tags()).isEmpty();
        assertThat(result.notes()).isEmpty();
    }

}
