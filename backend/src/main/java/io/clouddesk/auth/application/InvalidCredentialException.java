package io.clouddesk.auth.application;

public class InvalidCredentialException extends RuntimeException {
    public InvalidCredentialException() {
        super("Invalid email or password.");
    }
}
