package com.freelancehub.freelancehub.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        System.out.println("====== [JWT FILTER] Request URI: " + request.getRequestURI());

        String jwt = null;

        // 1. Check Cookies first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                }
            }
        }

        log.debug("=== JwtAuthFilter ===");
        log.debug("URI: {}", request.getRequestURI());
        log.debug("JWT from cookie found: {}", jwt != null);

        // 2. Fallback to Authorization Header (useful for Postman testing)
        if (jwt == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                log.debug("JWT from header found");
            }
        }

        if (jwt == null) {
            log.debug("No token — skipping");
            filterChain.doFilter(request, response);
            return;
        }

        final String email;
        try {
            email = jwtService.extractEmail(jwt);
            log.debug("Extracted email: {}", email);
        } catch (JwtException e) {
            // Catches ExpiredJwtException, SignatureException, MalformedJwtException, etc.
            log.error("JWT Token invalid or expired: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        } catch (Exception e) {
            log.error("Unexpected error during token extraction", e);
            filterChain.doFilter(request, response);
            return;
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Note: This queries the database on every API call.
            // This is acceptable, but if you want maximum performance later,
            // you can build UserDetails directly from the JWT claims.
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("Authentication set successfully");
            } else {
                log.debug("Token invalid for user: {}", email);
            }
        }

        filterChain.doFilter(request, response);
    }
}