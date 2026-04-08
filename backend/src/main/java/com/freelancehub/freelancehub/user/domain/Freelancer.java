package com.freelancehub.freelancehub.user.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "freelancers")
@DiscriminatorValue("FREELANCER")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
public class Freelancer extends User {

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Double hourlyRate;

    @Column(nullable = false)
    private double rating = 0.0;

    @Column(length = 255)
    private String stripeAccountId;

    @Column(nullable = false)
    private boolean stripeOnboarded = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "freelancer_skills",
            joinColumns = @JoinColumn(name = "freelancer_id")
    )
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    public Freelancer() {
        setRole(Role.FREELANCER);
    }
}