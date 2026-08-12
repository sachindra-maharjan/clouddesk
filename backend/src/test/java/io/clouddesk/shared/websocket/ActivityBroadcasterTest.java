package io.clouddesk.shared.websocket;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import java.time.Instant;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileUploadedEvent;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class ActivityBroadcasterTest {

    @Mock
    ActivityWebSocketHandler activityWebSocketHandler;

    final ObjectMapper objectMapper = new ObjectMapper();
    ActivityBroadcaster broadcaster;

    @BeforeEach
    void setUp() {
        broadcaster = new ActivityBroadcaster(activityWebSocketHandler, objectMapper);
    }

    private FileUploadedEvent sampleEvent() {
        return new FileUploadedEvent(
                "Q3 board deck", "Maria Alvarez", FileCategory.PRESENTATION, 1024,
                Instant.parse("2026-07-27T09:00:00Z"));
    }

    @Test
    void broadcastsTheEventWrappedWithATypeDiscriminator() {
        broadcaster.onFileUpload(sampleEvent());

        verify(activityWebSocketHandler).broadcast(contains("\"type\":\"FILE_UPLOADED\""));
        verify(activityWebSocketHandler).broadcast(contains("\"displayName\":\"Q3 board deck\""));
    }

    @Test
    void aBroadcastFailureNeverPropagatesBackToTheCaller() {
        doThrow(new RuntimeException("session write failed")).when(activityWebSocketHandler).broadcast(any());

        Assertions.assertThatCode(() -> broadcaster.onFileUpload(sampleEvent())).doesNotThrowAnyException();
    }

}
