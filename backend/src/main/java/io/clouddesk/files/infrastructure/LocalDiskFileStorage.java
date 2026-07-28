package io.clouddesk.files.infrastructure;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.stereotype.Component;

import io.clouddesk.files.application.FileStorage;
import io.clouddesk.files.application.StoredFile;

@Component
public class LocalDiskFileStorage implements FileStorage {

    private final Path rootDir;

    public LocalDiskFileStorage(FilesProperties properties) {
        this.rootDir = Path.of(properties.storageRootDir());
    }

    @Override
    public StoredFile store(byte[] content, String suggestedFilename) {
        try {
            String datedFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
            Path targetDir = rootDir.resolve(datedFolder);
            Files.createDirectories(targetDir);

            String storedName = UUID.randomUUID() + "-" + sanitize(suggestedFilename);
            Files.write(targetDir.resolve(storedName), content);

            String relativePath = datedFolder + "/" + storedName;
            return new StoredFile(relativePath, content.length);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store uploaded file.", e);
        }
    }

    @Override
    public byte[] load(String storagePath) {
        try {
            return Files.readAllBytes(rootDir.resolve(storagePath));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read stored file.", e);
        }
    }

    private String sanitize(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

}
