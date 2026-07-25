package io.clouddesk.auth.interfaces;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.not;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class AuthControllerTest {

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

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    @Test
    void seedUserCanLoginWithCorrectPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(loginJson("maria.alvarez@clouddesk.io", "Password123!")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(blankOrNullString())))
                .andExpect(jsonPath("$.user.email").value("maria.alvarez@clouddesk.io"))
                .andExpect(jsonPath("$.user.fullName").value("Maria Alvarez"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    @Test
    void loginFailsWithWrongPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(loginJson("maria.alvarez@clouddesk.io", "WRONG_PASSWORD")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    void loginFailsWithUnknownEmail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(loginJson("unknown@clouddesk.io", "Password123!")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    void loginRejectsForMalformedEmail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(loginJson("maria.alveraz.invalid", "Password123!")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void protectedEndpointRejectsRequestsWithoutAccessToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .contentType("application/json"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required."));
    }

    @Test
    void protectedEndpointAcceptsValidAccessToken() throws Exception {
        var loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(loginJson("maria.alvarez@clouddesk.io", "Password123!")))
                .andReturn();

        var json = loginResult.getResponse().getContentAsString();
        var token = objectMapper.readTree(json).get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                .contentType("application/json")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("maria.alvarez@clouddesk.io"))
                .andExpect(jsonPath("$.fullName").value("Maria Alvarez"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    private String loginJson(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(new LoginRequest(email, password));
    }

}
