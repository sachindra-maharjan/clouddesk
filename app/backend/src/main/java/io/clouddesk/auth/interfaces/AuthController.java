package io.clouddesk.auth.interfaces;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.clouddesk.auth.application.AuthResult;
import io.clouddesk.auth.application.AuthenticationService;
import io.clouddesk.auth.application.LoginCommand;
import io.clouddesk.auth.domain.User;
import io.clouddesk.auth.domain.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationService authenticationService, UserRepository userRepository) {
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        AuthResult authResult = authenticationService.login(new LoginCommand(request.email(), request.password()));
        return LoginResponse.from(authResult.token(), authResult.user());
    }

    @GetMapping("/me")
    public LoginResponse.UserSummary me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new LoginResponse.UserSummary(user.id().toString(), user.email(), user.fullName(), user.role().name());
    }

}
