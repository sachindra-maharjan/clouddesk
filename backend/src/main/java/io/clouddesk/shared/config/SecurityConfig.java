package io.clouddesk.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * SCAFFOLD PLACEHOLDER.
 * This permissive chain exists only so the app boots and health checks work
 * during Phase 2. The "User Authentication" feature (Phase 3, step 2) replaces
 * this with a real stateless JWT filter chain, written test-first:
 *   - AuthControllerTest (login returns 200 + token / 401 on bad credentials)
 *   - JwtAuthenticationFilterTest (valid/expired/missing token handling)
 *   - Endpoint-level @WithMockUser / bearer-token integration tests
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
