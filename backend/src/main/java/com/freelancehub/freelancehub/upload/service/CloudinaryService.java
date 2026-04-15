package com.freelancehub.freelancehub.upload.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public void verifyAsset(String publicId) {
        try {
            cloudinary.api().resource(publicId, Map.of());
        } catch (Exception e) {
            log.warn("Cloudinary asset not found: {}", publicId);
            throw new IllegalArgumentException("Asset not found in Cloudinary: " + publicId);
        }
    }
}