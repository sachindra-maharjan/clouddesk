package io.clouddesk.auth.application;

public interface PasswordHasher {
    boolean matches(String plainPassword, String hashedPassword);
}
