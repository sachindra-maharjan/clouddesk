package io.clouddesk.files.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import io.clouddesk.files.domain.FileQuery;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.UploadedFile;
import io.clouddesk.shared.domain.PageResult;

@ExtendWith(MockitoExtension.class)
public class ListFileServiceTest {

    @Mock
    FileRepository fileRepository;

    @Test
    void delegatesTheQueryToFileRepository() {
        ListFileService listFileService = new ListFileService(fileRepository);

        FileQuery query = new FileQuery(UUID.randomUUID(), null, null, 0, 0);
        PageResult<UploadedFile> expected = new PageResult<>(List.of(), 0, 0, 0);

        when(fileRepository.findPage(query)).thenReturn(expected);

        var got = listFileService.list(query);

        assertThat(got).isSameAs(expected);

    }

}
