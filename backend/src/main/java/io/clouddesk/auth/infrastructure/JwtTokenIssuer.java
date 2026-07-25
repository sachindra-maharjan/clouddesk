package io.clouddesk.auth.infrastructure;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import io.clouddesk.auth.application.TokenIssuer;
import io.clouddesk.auth.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JwtTokenIssuer implements TokenIssuer {

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtTokenIssuer(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.secretKey = Keys.hmacShaKeyFor(this.jwtProperties.secretKey().getBytes());
    }

    public String issue(User user) {
        Instant now = Instant.now();
        Instant exp = now.plus(jwtProperties.expirationMinutes(), ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(user.email())
                .claim("userId", user.id().toString())
                .claim("displayName", user.fullName())
                .claim("roles", user.role().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(this.secretKey)
                .compact();

    }

}
