package io.clouddesk.auth.application;

import io.clouddesk.auth.domain.User;
import io.clouddesk.auth.domain.UserRepository;

public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final TokenIssuer tokenIssuer;

    public AuthenticationService(UserRepository userRepository, PasswordHasher passwordHasher,
            TokenIssuer tokenIssuer) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenIssuer = tokenIssuer;
    }

    public AuthResult login(LoginCommand command) throws InvalidCredentialException {
        User user = userRepository.findByEmail(command.email())
                .orElseThrow(InvalidCredentialException::new);

        if (!passwordHasher.matches(command.password(), user.passwordHash())) {
            throw new InvalidCredentialException();
        }

        String token = tokenIssuer.issue(user);
        return new AuthResult(token, user);
    }

}
