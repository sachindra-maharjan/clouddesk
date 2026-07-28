package io.clouddesk.files.interfaces;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import tools.jackson.databind.ObjectMapper;
import java.nio.file.Path;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class FileControllerTest {

    @Container
    @SuppressWarnings("resource")
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
    String rChenToken;

    @BeforeEach
    void authenticate() throws Exception {
        mariaToken = tokenFor("maria.alvarez@clouddesk.io");
        rChenToken = tokenFor("r.chen@clouddesk.io");
    }

    private String tokenFor(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content("{\"email\":\"" + email + "\",\"password\":\"Password123!\"}"))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    @Test
    void uploadsAFileAndReturnsItsSummary() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "board-deck.pptx", "application/vnd.ms-powerpoint", "content".getBytes());

        mockMvc.perform(multipart("/api/files", file)
                .param("displayName", "Q3 board deck")
                .param("category", "PRESENTATION")
                .param("visibility", "TEAM")
                .param("tags", "finance", "q3")
                .param("notes", "For the board meeting")
                .header("Authorization", "Bearer " + mariaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Q3 board deck"))
                .andExpect(jsonPath("$.ownerName").value("Maria Alvarez"))
                .andExpect(jsonPath("$.category").value("PRESENTATION"));
    }

    @Test
    void rejectsUploadWithoutAToken() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "notes.txt", "text/plain", "hi".getBytes());

        mockMvc.perform(multipart("/api/files", file)
                .param("displayName", "Notes")
                .param("category", "DOCUMENT")
                .param("visibility", "TEAM"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listsOnlyFilesVisibleToTheRequester() throws Exception {
        uploadAs(mariaToken, "Team file", "TEAM");
        uploadAs(mariaToken, "Maria's private file", "PRIVATE");

        mockMvc.perform(get("/api/files").header("Authorization", "Bearer " + rChenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].displayName", hasItem("Team file")))
                .andExpect(jsonPath("$.items[*].displayName", not(hasItem("Maria's private file"))));
    }

    @Test
    void ownerCanDownloadAPrivateFileButOthersCannot() throws Exception {
        String fileId = uploadAs(mariaToken, "Private notes", "PRIVATE");

        mockMvc.perform(get("/api/files/" + fileId + "/download").header("Authorization", "Bearer " + mariaToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/files/" + fileId + "/download").header("Authorization", "Bearer " + rChenToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void downloadOfAnUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/files/00000000-0000-0000-0000-000000000000/download")
                .header("Authorization", "Bearer " + mariaToken))
                .andExpect(status().isNotFound());
    }

    private String uploadAs(String token, String displayName, String visibility) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "f.txt", "text/plain", "hi".getBytes());
        String response = mockMvc.perform(multipart("/api/files", file)
                .param("displayName", displayName)
                .param("category", "DOCUMENT")
                .param("visibility", visibility)
                .header("Authorization", "Bearer " + token))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

}
