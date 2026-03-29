package com.freelancehub.freelancehub.user.service;

import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.ClientRepository;
import com.freelancehub.freelancehub.user.repository.FreelancerRepository;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FreelancerRepository freelancerRepository;
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    @Transactional(readOnly = true)
    public Freelancer findFreelancerById(String id) {
        return freelancerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Freelancer not found: " + id));
    }

    @Transactional(readOnly = true)
    public Client findClientById(String id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client not found: " + id));
    }

    @Transactional
    public void suspendUser(String userId) {
        User user = findById(userId);
        if (!user.isActive()) {
            throw new IllegalStateException("User is already suspended");
        }
        user.setActive(false);
    }

    @Transactional
    public void activateUser(String userId) {
        User user = findById(userId);
        if (user.isActive()) {
            throw new IllegalStateException("User is already active");
        }
        user.setActive(true);
    }


}