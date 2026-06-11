package com.freelancehub.freelancehub.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class InternalApiFilter extends OncePerRequestFilter {

    @Value("${app.internal.secret}")
    private String internalApiSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        log.info("➡️ [INTERNAL FILTER] Intercepting request for: {}", path);

        if (path.startsWith("/api/v1/payments/webhook")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestToken = request.getHeader("X-Internal-Token");

        // --- NEW DETAILED DEBUGGING LOGIC ---
        boolean isAuthorized = false;

        if (requestToken == null) {
            log.warn("❌ [SECURITY DEBUG] Token is completely MISSING in header 'X-Internal-Token'");
        } else if (requestToken.isEmpty()) {
            log.warn("❌ [SECURITY DEBUG] Token was sent, but it is EMPTY");
        } else if (!requestToken.equals(internalApiSecret)) {
            // Mask the tokens so we can debug without leaking secrets to the logs
            String safeExpected = maskToken(internalApiSecret);
            String safeGot = maskToken(requestToken);
            log.warn("❌ [SECURITY DEBUG] TOKEN MISMATCH! Spring Expected: '{}' (len: {}), Next.js Sent: '{}' (len: {})",
                    safeExpected, internalApiSecret.length(),
                    safeGot, requestToken.length());
        } else {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Unauthorized: Direct access is not allowed.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    // Helper method to safely print parts of the token for debugging
    private String maskToken(String token) {
        if (token == null) return "null";
        if (token.length() <= 4) return "***";
        // Shows first 2 chars and last 2 chars (e.g., "my-secret" -> "my***et")
        return token.substring(0, 2) + "***" + token.substring(token.length() - 2);
    }
}