package io.clouddesk.files.application;

public interface FileStorage {

    /**
     * Port. Keeps the application layer ignorant of *where* file bytes live —
     * local disk today (LocalDiskFileStorage), could become S3/GCS later
     * without UploadFileService or DownloadFileService changing at all.
     */
    StoredFile store(byte[] content, String suggestedFilename);

    byte[] load(String storagePath);

}