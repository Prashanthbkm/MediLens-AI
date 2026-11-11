
package com.medilens.backend.util;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileStorageUtil {

    private final Path uploadDirectory =
            Paths.get("uploads/medical-reports")
                    .toAbsolutePath()
                    .normalize();

    // Store uploaded medical report
    public String storeFile(
            MultipartFile file,
            String storedFilename) {

        try {
            Files.createDirectories(uploadDirectory);

            Path targetLocation =
                    uploadDirectory.resolve(storedFilename).normalize();

            if (!targetLocation.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation);
            }

            return targetLocation.toString();

        } catch (IOException exception) {
            throw new RuntimeException(
                    "Could not store uploaded file",
                    exception
            );
        }
    }

    // Load medical report securely
    public Resource loadFileAsResource(String storagePath) {

        try {
            if (storagePath == null || storagePath.isBlank()) {
                throw new IllegalArgumentException("Invalid storage path");
            }

            Path requestedPath = Paths.get(storagePath)
                    .toAbsolutePath()
                    .normalize();

            Path realUploadDirectory = uploadDirectory.toRealPath();

            if (!requestedPath.startsWith(uploadDirectory)
                    || !Files.exists(requestedPath)) {
                throw new IllegalArgumentException("File not found");
            }

            Path realFilePath = requestedPath.toRealPath();

            if (!realFilePath.startsWith(realUploadDirectory)
                    || !Files.isRegularFile(realFilePath)
                    || !Files.isReadable(realFilePath)) {
                throw new IllegalArgumentException("Invalid file access");
            }

            Resource resource = new UrlResource(realFilePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new RuntimeException("Could not read medical report");

        } catch (IOException exception) {
            throw new RuntimeException(
                    "Could not load medical report",
                    exception
            );
        }
    }

    // Delete stored medical report
    public void deleteFile(String storagePath) {

        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        try {
            Path filePath = Paths.get(storagePath)
                    .toAbsolutePath()
                    .normalize();

            if (!filePath.startsWith(uploadDirectory)
                    || !Files.exists(filePath)) {
                return;
            }

            Path realUploadDirectory = uploadDirectory.toRealPath();
            Path realFilePath = filePath.toRealPath();

            if (!realFilePath.startsWith(realUploadDirectory)
                    || !Files.isRegularFile(realFilePath)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            Files.deleteIfExists(realFilePath);

        } catch (IOException exception) {
            throw new RuntimeException(
                    "Could not delete medical report file",
                    exception
            );
        }
    }
}
