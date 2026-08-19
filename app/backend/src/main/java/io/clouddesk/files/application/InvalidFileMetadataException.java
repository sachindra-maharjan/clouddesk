package io.clouddesk.files.application;

public class InvalidFileMetadataException extends RuntimeException {
    public InvalidFileMetadataException(String message) {
        super(message);
    }
}
