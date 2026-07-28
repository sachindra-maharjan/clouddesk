package io.clouddesk.files.application;

import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.FileVisibility;
import io.clouddesk.files.domain.UploadedFile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DownloadFileServiceTest {

    @Mock
    FileRepository fileRepository;
    @Mock
    FileStorage fileStorage;

    DownloadFileService downloadFileService;

    final UUID ownerId = UUID.randomUUID();
    final UUID fileId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        downloadFileService = new DownloadFileService(fileRepository, fileStorage);
    }

    private UploadedFile fileWith(FileVisibility visibility, UUID owner) {
        return new UploadedFile(
                fileId, owner, "Maria Alvarez", "Q3 deck", "deck.pptx", "application/pptx",
                2048, "2026/07/deck.pptx", FileCategory.PRESENTATION, visibility, List.of(), "", Instant.now());
    }

    @Test
    void returnsContentWhenTheOwnerRequestsAPrivateFile() {
        UploadedFile file = fileWith(FileVisibility.PRIVATE, ownerId);
        when(fileRepository.findById(fileId)).thenReturn(Optional.of(file));
        when(fileStorage.load(file.storagePath())).thenReturn(new byte[] { 1, 2, 3 });

        FileContent result = downloadFileService.download(fileId, ownerId);

        assertThat(result.content()).containsExactly(1, 2, 3);
    }

    @Test
    void returnsContentForAnyRequesterWhenVisibilityIsTeam() {
        UploadedFile file = fileWith(FileVisibility.TEAM, ownerId);
        UUID otherUser = UUID.randomUUID();
        when(fileRepository.findById(fileId)).thenReturn(Optional.of(file));
        when(fileStorage.load(file.storagePath())).thenReturn(new byte[] { 9 });

        FileContent result = downloadFileService.download(fileId, otherUser);

        assertThat(result.metadata()).isEqualTo(file);
    }

    @Test
    void deniesAccessToAPrivateFileForNonOwners() {
        UploadedFile file = fileWith(FileVisibility.PRIVATE, ownerId);
        UUID otherUser = UUID.randomUUID();
        when(fileRepository.findById(fileId)).thenReturn(Optional.of(file));

        assertThatThrownBy(() -> downloadFileService.download(fileId, otherUser))
                .isInstanceOf(FileAccessDeniedException.class);
    }

    @Test
    void throwsNotFoundForAnUnknownId() {
        when(fileRepository.findById(fileId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> downloadFileService.download(fileId, ownerId))
                .isInstanceOf(FileNotFoundException.class);
    }
}
