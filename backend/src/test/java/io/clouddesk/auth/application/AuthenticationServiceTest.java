package io.clouddesk.auth.application;

import io.clouddesk.auth.application.AuthResult;
import io.clouddesk.auth.application.AuthenticationService;
import io.clouddesk.auth.application.InvalidCredentialException;
import io.clouddesk.auth.application.LoginCommand;
import io.clouddesk.auth.application.PasswordHasher;
import io.clouddesk.auth.application.TokenIssuer;
import io.clouddesk.auth.domain.Role;
import io.clouddesk.auth.domain.User;
import io.clouddesk.auth.domain.UserRepository;

import java.util.Optional;
import java.util.UUID;

import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordHasher passwordHasher;

    @Mock
    TokenIssuer tokenIssuer;

    @InjectMocks
    AuthenticationService authenticationService;

    User seededUser;

    @BeforeEach
    void setUp() {
        seededUser = new User(
                UUID.randomUUID(),
                "maria.alvarez@clouddesk.io",
                "$2b$10$hashedvalue",
                "Maria Alvarez",
                Role.ADMIN);
    }

    @Test
    void issuesTokenWhenCredenialsAreValid() {
        when(userRepository.findByEmail("maria.alvarez@clouddesk.io")).thenReturn(Optional.of(seededUser));
        when(passwordHasher.matches("Password123!", seededUser.passwordHash())).thenReturn(true);
        when(tokenIssuer.issue(seededUser)).thenReturn("fake-jwt-token");

        AuthResult authResult = authenticationService
                .login(new LoginCommand("maria.alvarez@clouddesk.io", "Password123!"));

        assertThat(authResult.token()).isEqualTo("fake-jwt-token");
        assertThat(authResult.user()).isEqualTo(seededUser);
    }

    @Test
    void rejectsUnknonEmail() {
        when(userRepository.findByEmail("unknow@clouddesk.io")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.login(new LoginCommand("unknow@clouddesk.io", "Password123!")))
                .isInstanceOf(InvalidCredentialException.class)
                .hasMessage("Invalid email or password.");
    }

    @Test
    void rejectsInvalidPassword() {
        when(userRepository.findByEmail("maria.alvarez@clouddesk.io")).thenReturn(Optional.of(seededUser));
        when(passwordHasher.matches("Password123!", seededUser.passwordHash())).thenReturn(false);

        assertThatThrownBy(
                () -> authenticationService.login(new LoginCommand("maria.alvarez@clouddesk.io", "Password123!")))
                .isInstanceOf(InvalidCredentialException.class)
                .hasMessage("Invalid email or password.");
    }

    @Test
    void unknownEmailAndInvalidPasswordReturnSameErrorMessage() {
        when(userRepository.findByEmail("maria.alvarez@clouddesk.io")).thenReturn(Optional.of(seededUser));
        when(userRepository.findByEmail("unknown@clouddesk.io")).thenReturn(Optional.empty());
        when(passwordHasher.matches("wrong-password", seededUser.passwordHash())).thenReturn(false);

        String invalidPasswordMessage = catchMessage(() -> authenticationService
                .login(new LoginCommand("maria.alvarez@clouddesk.io", "wrong-password")));
        String unknownEmailMessage = catchMessage(() -> authenticationService
                .login(new LoginCommand("unknown@clouddesk.io", "wrong-password")));

        assertThat(invalidPasswordMessage)
                .isEqualTo(unknownEmailMessage);

    }

    private String catchMessage(Runnable action) {
        try {
            action.run();
            throw new AssertionError("Expected InvalidCredentialException");
        } catch (InvalidCredentialException e) {
            return e.getMessage();
        }
    }

}
