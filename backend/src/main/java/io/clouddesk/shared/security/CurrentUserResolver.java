package io.clouddesk.shared.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import io.clouddesk.auth.domain.User;
import io.clouddesk.auth.domain.UserRepository;

/**
 * JwtAuthenticationFilter only puts the user's email into the
 * SecurityContext (as the principal) plus a ROLE_* authority — it doesn't
 * carry the full User. Any feature that needs more than the email (the
 * Files feature needs id + displayName to stamp as the owner) asks this
 * instead of re-deriving "who is the current user" itself, so that logic
 * exists exactly once no matter how many features need it.
 */

@Component
public class CurrentUserResolver {

    private final UserRepository userRepository;

    public CurrentUserResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User resolve() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));
    }

}
