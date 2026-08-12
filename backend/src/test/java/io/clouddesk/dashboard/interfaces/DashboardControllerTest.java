package io.clouddesk.dashboard.interfaces;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import tools.jackson.databind.ObjectMapper;

import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class DashboardControllerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("clouddesk")
            .withUsername("clouddesk")
            .withPassword("clouddesk");

    @TempDir
    static Path storageDir;

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("clouddesk.files.storage-root-dir", storageDir::toString);
        registry.add("clouddesk.files.max-upload-size-bytes", () -> 25 * 1024 * 1024);
    }

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    String mariaToken;

    @BeforeEach
    void authenticate() throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content("{\"email\":\"maria.alvarez@clouddesk.io\",\"password\":\"Password123!\"}"))
                .andReturn().getResponse().getContentAsString();
        mariaToken = objectMapper.readTree(response).get("token").asText();
    }

    @Test
    void summaryReflectsFilesUploadedDuringTheTest() throws Exception {
        uploadFile("board-deck.pptx", "board deck");
        uploadFile("forecast.xlsx", "forecast");

        mockMvc.perform(get("/api/dashboard/summary").header("Authorization", "Bearer " + mariaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFiles").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.activeUsers").value(5))
                .andExpect(jsonPath("$.filesUploadedThisWeek").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));
    }

    @Test
    void storageTrendReturnsOnePointPerRequestedDay() throws Exception {
        mockMvc.perform(get("/api/dashboard/storage-trend?days=7").header("Authorization", "Bearer " + mariaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(7));
    }

    @Test
    void dashboardEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/dashboard/storage-trend")).andExpect(status().isUnauthorized());
    }

    private void uploadFile(String filename, String displayName) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", filename, "text/plain", "content".getBytes());
        mockMvc.perform(multipart("/api/files")
                .file(file)
                .param("displayName", displayName)
                .param("category", "DOCUMENT")
                .param("visibility", "TEAM")
                .header("Authorization", "Bearer " + mariaToken))
                .andExpect(status().isOk());
    }
}