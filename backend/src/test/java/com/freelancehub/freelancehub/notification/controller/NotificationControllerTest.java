package com.freelancehub.freelancehub.notification.controller;

import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.domain.ReferenceType;
import com.freelancehub.freelancehub.notification.dto.NotificationResponse;
import com.freelancehub.freelancehub.notification.dto.UnreadCountResponse;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.security.InternalApiFilter;
import com.freelancehub.freelancehub.security.JwtAuthFilter;
import com.freelancehub.freelancehub.web.support.WebMvcControllerTest;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = NotificationController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class NotificationControllerTest extends WebMvcControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("notificationEndpoints")
    void notificationEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, NotificationEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.successUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("notificationEndpoints")
    void notificationEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, NotificationEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("notificationEndpoints")
    void notificationEndpoint_whenAuthenticatedCorrectUser_returnsSuccess(String testName, NotificationEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.successUser())
                .andExpect(status().is2xxSuccessful());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("freelancerNotificationEndpoints")
    void notificationEndpoint_whenAuthenticatedFreelancer_returnsSuccess(String testName, NotificationEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.successUser())
                .andExpect(status().is2xxSuccessful());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("ownedNotificationEndpoints")
    void notificationOwnershipEndpoint_whenAuthenticatedNonOwner_returnsUnauthorized(String testName, NotificationEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), clientUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Not your notification"));
    }

    private ResultActions perform(NotificationEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
        MockHttpServletRequestBuilder request = request(endpoint.method(), endpoint.path())
                .accept(MediaType.APPLICATION_JSON);

        for (RequestPostProcessor processor : processors) {
            request.with(processor);
        }

        return mockMvc.perform(request);
    }

    private static Stream<Arguments> notificationEndpoints() {
        return Stream.of(
                Arguments.of("getNotifications", new NotificationEndpoint("getNotifications", HttpMethod.GET,
                        "/api/v1/notifications?page=0&size=20", clientUser())),
                Arguments.of("getUnreadCount", new NotificationEndpoint("getUnreadCount", HttpMethod.GET,
                        "/api/v1/notifications/unread-count", clientUser())),
                Arguments.of("markAsRead", new NotificationEndpoint("markAsRead", HttpMethod.PATCH,
                        "/api/v1/notifications/notif-client/read", clientUser())),
                Arguments.of("markAllAsRead", new NotificationEndpoint("markAllAsRead", HttpMethod.PATCH,
                        "/api/v1/notifications/read-all", clientUser()))
        );
    }

    private static Stream<Arguments> ownedNotificationEndpoints() {
        return Stream.of(
                Arguments.of("markAsRead", new NotificationEndpoint("markAsRead", HttpMethod.PATCH,
                        "/api/v1/notifications/notif-freelancer/read", freelancerUser()))
        );
    }

    private static Stream<Arguments> freelancerNotificationEndpoints() {
        return Stream.of(
                Arguments.of("getNotifications", new NotificationEndpoint("getNotifications", HttpMethod.GET,
                        "/api/v1/notifications?page=0&size=20", freelancerUser())),
                Arguments.of("getUnreadCount", new NotificationEndpoint("getUnreadCount", HttpMethod.GET,
                        "/api/v1/notifications/unread-count", freelancerUser())),
                Arguments.of("markAsRead", new NotificationEndpoint("markAsRead", HttpMethod.PATCH,
                        "/api/v1/notifications/notif-freelancer/read", freelancerUser())),
                Arguments.of("markAllAsRead", new NotificationEndpoint("markAllAsRead", HttpMethod.PATCH,
                        "/api/v1/notifications/read-all", freelancerUser()))
        );
    }

    private record NotificationEndpoint(
            String name,
            HttpMethod method,
            String path,
            RequestPostProcessor successUser
    ) {}

    @TestConfiguration
    static class NotificationServiceTestConfig {

        @Bean
        StubNotificationService notificationService() {
            return new StubNotificationService();
        }
    }

    public static class StubNotificationService extends NotificationService {

        public StubNotificationService() {
            super(null, null, null);
        }

        @Override
        public Page<NotificationResponse> getNotifications(String userId, Pageable pageable) {
            return new PageImpl<>(List.of(notification("notif-" + suffix(userId))));
        }

        @Override
        public UnreadCountResponse getUnreadCount(String userId) {
            return new UnreadCountResponse(2);
        }

        @Override
        public void markAsRead(String notificationId, String userId) {
            if ("notif-freelancer".equals(notificationId) && !"freelancer-1".equals(userId)) {
                throw new UnauthorizedException("Not your notification");
            }
            if ("notif-client".equals(notificationId) && !"client-1".equals(userId)) {
                throw new UnauthorizedException("Not your notification");
            }
        }

        @Override
        public void markAllAsRead(String userId) {
        }

        private String suffix(String userId) {
            return userId.startsWith("freelancer") ? "freelancer" : "client";
        }

        private NotificationResponse notification(String id) {
            return new NotificationResponse(
                    id,
                    NotificationType.BID_RECEIVED,
                    "Bid received",
                    "A freelancer placed a bid",
                    false,
                    "bid-1",
                    ReferenceType.BID,
                    LocalDateTime.now()
            );
        }
    }
}
