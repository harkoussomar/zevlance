package com.freelancehub.freelancehub.web.support;

import com.freelancehub.freelancehub.config.SecurityConfig;
import com.freelancehub.freelancehub.security.InternalApiFilter;
import com.freelancehub.freelancehub.security.JwtAuthFilter;
import com.freelancehub.freelancehub.user.domain.Admin;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.domain.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.io.IOException;

@TestPropertySource(properties = {
        "app.internal.secret=test-secret",
        "app.cors.allowed-origins=http://localhost:3000",
        "jwt.secret=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "jwt.expiration=86400000"
})
@Import({
        SecurityConfig.class,
        InternalApiFilter.class,
        WebMvcControllerTest.TestSecurityBeans.class
})
public abstract class WebMvcControllerTest {

    protected static RequestPostProcessor internalApi() {
        return request -> {
            request.addHeader("X-Internal-Token", "test-secret");
            return request;
        };
    }

    protected static RequestPostProcessor adminUser() {
        return authenticatedUser(user(new Admin(), "admin-1", "admin@example.com", "Admin User"));
    }

    protected static RequestPostProcessor clientUser() {
        return authenticatedUser(user(new Client(), "client-1", "client@example.com", "Client User"));
    }

    protected static RequestPostProcessor freelancerUser() {
        return authenticatedUser(user(new Freelancer(), "freelancer-1", "freelancer@example.com", "Freelancer User"));
    }

    protected static RequestPostProcessor authenticatedUser(User user) {
        return SecurityMockMvcRequestPostProcessors.authentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
        );
    }

    private static <T extends User> T user(T user, String id, String email, String name) {
        user.setId(id);
        user.setEmail(email);
        user.setName(name);
        user.setPassword("{noop}password");
        user.setActive(true);
        user.setEmailVerified(true);
        return user;
    }

    @TestConfiguration
    static class TestSecurityBeans {

        @Bean
        JwtAuthFilter jwtAuthFilter() {
            return new JwtAuthFilter(null, null) {
                @Override
                protected void doFilterInternal(HttpServletRequest request,
                                                HttpServletResponse response,
                                                FilterChain filterChain)
                        throws ServletException, IOException {
                    filterChain.doFilter(request, response);
                }
            };
        }

        @Bean
        UserDetailsService userDetailsService() {
            return username -> {
                throw new UsernameNotFoundException(username);
            };
        }
    }
}
