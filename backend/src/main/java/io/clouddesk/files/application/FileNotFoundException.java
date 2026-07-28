package io.clouddesk.files.application;

import java.util.UUID;

public class FileNotFoundException extends RuntimeException {
    public FileNotFoundException(UUID fileId) {
        super("No file found with id " + fileId);
    }
}
