package io.clouddesk.auth.application;

import io.clouddesk.auth.domain.User;

public interface TokenIssuer {
    String issue(User user);
}
