package io.clouddesk;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Scaffold-level smoke test: the app context must load against a real
 * Postgres (via Testcontainers) with Flyway migrations applied cleanly.
 * Every feature from here on adds its own focused tests alongside this one.
 */
@SpringBootTest
@Testcontainers
class CloudDeskApplicationTests {

    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("clouddesk")
            .withUsername("clouddesk")
            .withPassword("clouddesk");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void contextLoads() {
        // If the context fails to start (bad config, failed migration,
        // misconfigured security), this test fails fast.
    }
}
