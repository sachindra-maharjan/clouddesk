package io.clouddesk.auth.interfaces;

import io.clouddesk.auth.domain.User;

public record LoginResponse(String token, UserSummary user) {

    public record UserSummary(String id, String email, String fullName, String role) {
    }

    public static LoginResponse from(String token, User user) {
        return new LoginResponse(token,
                new UserSummary(user.id().toString(), user.email(), user.fullName(), user.role().name()));
    }
}
