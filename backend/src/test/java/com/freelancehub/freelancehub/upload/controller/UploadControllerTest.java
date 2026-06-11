package com.freelancehub.freelancehub.upload.controller;

import com.freelancehub.freelancehub.security.InternalApiFilter;
import com.freelancehub.freelancehub.security.JwtAuthFilter;
import com.freelancehub.freelancehub.upload.service.CloudinaryService;
import com.freelancehub.freelancehub.web.support.WebMvcControllerTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = UploadController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class UploadControllerTest extends WebMvcControllerTest {

    private static final String VALID_VERIFY_BODY = """
            {
              "publicId": "profiles/client-1/avatar",
              "secureUrl": "https://res.cloudinary.test/profiles/client-1/avatar.jpg"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void verifyUpload_whenMissingInternalToken_returnsUnauthorized() throws Exception {
        perform(VALID_VERIFY_BODY, clientUser())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void verifyUpload_whenMissingAuthenticationWithInternalToken_returnsUnauthorized() throws Exception {
        perform(VALID_VERIFY_BODY, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("authenticatedUsers")
    void verifyUpload_whenAuthenticatedUser_returnsSuccess(String testName, RequestPostProcessor user) throws Exception {
        perform(VALID_VERIFY_BODY, internalApi(), user)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://res.cloudinary.test/profiles/client-1/avatar.jpg"));
    }

    @Test
    void verifyUpload_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(null, internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void verifyUpload_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform("{\"publicId\":\"\",\"secureUrl\":\"\"}", internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void verifyUpload_whenCloudinaryAssetDoesNotExist_returnsBadRequest() throws Exception {
        perform(VALID_VERIFY_BODY.replace("profiles/client-1/avatar", "missing-asset"), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Asset not found in Cloudinary: missing-asset"));
    }

    private ResultActions perform(String body, RequestPostProcessor... processors) throws Exception {
        MockHttpServletRequestBuilder request = request(HttpMethod.POST, "/api/v1/upload/verify")
                .accept(MediaType.APPLICATION_JSON);

        if (body != null) {
            request.contentType(MediaType.APPLICATION_JSON)
                    .content(body);
        }

        for (RequestPostProcessor processor : processors) {
            request.with(processor);
        }

        return mockMvc.perform(request);
    }

    private static Stream<Arguments> authenticatedUsers() {
        return Stream.of(
                Arguments.of("client", clientUser()),
                Arguments.of("freelancer", freelancerUser()),
                Arguments.of("admin", adminUser())
        );
    }

    @TestConfiguration
    static class UploadServiceTestConfig {

        @Bean
        StubCloudinaryService cloudinaryService() {
            return new StubCloudinaryService();
        }
    }

    public static class StubCloudinaryService extends CloudinaryService {

        public StubCloudinaryService() {
            super(null);
        }

        @Override
        public void verifyAsset(String publicId) {
            if ("missing-asset".equals(publicId)) {
                throw new IllegalArgumentException("Asset not found in Cloudinary: " + publicId);
            }
        }
    }
}
