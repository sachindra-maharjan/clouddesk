package io.clouddesk.auth.domain;

import java.util.UUID;

public record User(
        UUID id,
        String email,
        String passwordHash,
        String fullName,
        Role role) {
}
