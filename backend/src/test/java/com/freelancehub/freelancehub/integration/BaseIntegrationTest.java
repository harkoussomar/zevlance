package com.freelancehub.freelancehub.integration;

import com.freelancehub.freelancehub.notification.service.EmailService;
import org.junit.jupiter.api.TestInstance;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@Transactional
@ActiveProfiles("test")
@Import(BaseIntegrationTest.NoopExternalAdaptersConfig.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @TestConfiguration
    static class NoopExternalAdaptersConfig {

        @Bean
        @Primary
        EmailService emailService() {
            return new EmailService("test-api-key") {
                @Override
                public void send(String to, String subject, String html) {
                    // External email delivery is outside the service/DB integration boundary.
                }
            };
        }
    }
}
