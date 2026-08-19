package io.clouddesk.files.application;

public class FileAccessDeniedException extends RuntimeException {
    public FileAccessDeniedException() {
        super("You do not have access to this file.");
    }
}
