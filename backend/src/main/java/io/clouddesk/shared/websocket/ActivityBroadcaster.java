package io.clouddesk.shared.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import io.clouddesk.files.domain.FileUploadedEvent;
import tools.jackson.databind.ObjectMapper;

@Component
public class ActivityBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(ActivityBroadcaster.class);

    private final ActivityWebSocketHandler activityWebSocketHandler;
    private final ObjectMapper objectMapper;

    public ActivityBroadcaster(ActivityWebSocketHandler activityWebSocketHandler, ObjectMapper objectMapper) {
        this.activityWebSocketHandler = activityWebSocketHandler;
        this.objectMapper = objectMapper;
    }

    public void onFileUpload(FileUploadedEvent event) {
        broadcast("FILE_UPLOADED", event);
    }

    private void broadcast(String type, Object payload) {
        try {
            ActivityMessage message = new ActivityMessage(type, payload);
            activityWebSocketHandler.broadcast(objectMapper.writeValueAsString(message));
        } catch (Exception e) {
            log.error("Failed to broadcast activity message of type {}", type);
        }
    }

    private record ActivityMessage(String type, Object payload) {
    }
}
