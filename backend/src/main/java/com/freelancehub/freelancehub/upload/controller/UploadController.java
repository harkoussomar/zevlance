package com.freelancehub.freelancehub.upload.controller;

import com.freelancehub.freelancehub.upload.dto.VerifyUploadRequest;
import com.freelancehub.freelancehub.upload.dto.VerifyUploadResponse;
import com.freelancehub.freelancehub.upload.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/verify")
    public ResponseEntity<VerifyUploadResponse> verify(
            @RequestBody @Valid VerifyUploadRequest request
    ) {
        cloudinaryService.verifyAsset(request.publicId());
        return ResponseEntity.ok(new VerifyUploadResponse(request.secureUrl()));
    }
}