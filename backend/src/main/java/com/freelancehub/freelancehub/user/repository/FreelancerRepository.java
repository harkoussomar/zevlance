package com.freelancehub.freelancehub.user.repository;

import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FreelancerRepository extends JpaRepository<Freelancer, String> {

    Optional<Freelancer> findByStripeAccountId(String stripeAccountId);
}
