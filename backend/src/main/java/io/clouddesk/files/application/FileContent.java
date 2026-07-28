package io.clouddesk.files.application;

import io.clouddesk.files.domain.UploadedFile;

public record FileContent(UploadedFile metadata, byte[] content) {

}
