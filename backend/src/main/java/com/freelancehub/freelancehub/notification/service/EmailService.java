package com.freelancehub.freelancehub.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailService {

    private final RestClient restClient;

    @Value("${resend.from-email}")
    private String fromEmail;
    // JUST FOR TESTING
    @Value("${app.email.dev-override:}")
    private String devOverride;

    public EmailService(@Value("${resend.api-key}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public void send(String to, String subject, String html) {
        String recipient = devOverride.isBlank() ? to : devOverride;

        try {
            Map<String, Object> body = Map.of(
                    "from", fromEmail,
                    "to", List.of(recipient), // ✅ use recipient here
                    "subject", subject,
                    "html", html
            );

            restClient.post()
                    .uri("/emails")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Email sent → {} | subject: {}", recipient, subject);

        } catch (Exception e) {
            log.error("Email send failed → {} | {}", recipient, e.getMessage());
        }
    }
}