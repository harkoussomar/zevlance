package com.freelancehub.freelancehub.auth;

import com.freelancehub.freelancehub.auth.dto.*;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.security.JwtService;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public LoginResult registerFreelancer(RegisterFreelancerRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        Freelancer freelancer = new Freelancer();
        freelancer.setName(request.name());
        freelancer.setEmail(request.email());
        freelancer.setPassword(passwordEncoder.encode(request.password()));
        freelancer.setPhone(request.phone());

        userRepository.save(freelancer);
        return buildLoginResult(freelancer);
    }

    @Transactional
    public LoginResult registerClient(RegisterClientRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        Client client = new Client();
        client.setName(request.name());
        client.setEmail(request.email());
        client.setPassword(passwordEncoder.encode(request.password()));
        client.setPhone(request.phone());
        client.setCompanyName(request.companyName());
        client.setCompanyDescription(request.companyDescription());
        client.setWebsite(request.website());

        userRepository.save(client);
        return buildLoginResult(client);
    }

    public LoginResult login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = (User) auth.getPrincipal();
        return buildLoginResult(user);
    }

    private LoginResult buildLoginResult(User user) {
        String token = jwtService.generateToken(user);
        AuthResponse response = new AuthResponse(user.getEmail(), user.getRole().name(), user.getId());
        return new LoginResult(token, response);
    }
}