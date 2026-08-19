package io.clouddesk.auth.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import io.clouddesk.auth.application.AuthenticationService;
import io.clouddesk.auth.application.PasswordHasher;
import io.clouddesk.auth.application.TokenIssuer;
import io.clouddesk.auth.domain.UserRepository;

@Configuration
public class AuthBeansConfig {

    @Bean
    public AuthenticationService authenticationService(UserRepository userRepository, PasswordHasher passwordHasher,
            TokenIssuer tokenIssuer) {
        return new AuthenticationService(userRepository, passwordHasher, tokenIssuer);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public TokenIssuer tokenIssuer(JwtProperties jwtProperties) {
        return new JwtTokenIssuer(jwtProperties);
    }
}
