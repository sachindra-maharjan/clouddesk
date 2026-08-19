package io.clouddesk.auth.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;

import io.clouddesk.auth.domain.Role;
import io.clouddesk.auth.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JwtTokenIssuerTest {

    private final JwtProperties jwtProperties = new JwtProperties(
            "test-only-secret-key-must-be-at-least-256-bits-long-for-hs256", 60);
    private final JwtTokenIssuer jwtTokenIssuer = new JwtTokenIssuer(jwtProperties);

    private final User user = new User(
            UUID.randomUUID(), "maria.alvarez@clouddesk.io", "unknown-hash",
            "Maria Alvarez", Role.MEMBER);

    @Test
    void issuedTokenContainsUserEmailAsSubject() {
        String token = jwtTokenIssuer.issue(user);
        Claims claims = parseClaims(token);

        assertThat(claims.getSubject()).isEqualTo(user.email());
    }

    @Test
    void issuedTokenExpiresApproxInConfiguredMinutesFromNow() {
        String token = jwtTokenIssuer.issue(user);
        Claims claims = parseClaims(token);

        long secondsUnitExpiry = claims.getExpiration().toInstant().getEpochSecond() - Instant.now().getEpochSecond();

        assertThat(secondsUnitExpiry).isBetween(59L * 60, 61L * 60);

    }

    private Claims parseClaims(String token) {
        SecretKey secretKey = Keys.hmacShaKeyFor(jwtProperties.secretKey().getBytes());
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
