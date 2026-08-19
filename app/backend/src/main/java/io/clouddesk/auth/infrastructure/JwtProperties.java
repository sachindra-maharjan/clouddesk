package io.clouddesk.auth.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "clouddesk.jwt")
public record JwtProperties(String secretKey, long expirationMinutes) {
}
