package io.clouddesk.auth.application;

import io.clouddesk.auth.domain.User;

public record AuthResult(String token, User user) {

}
