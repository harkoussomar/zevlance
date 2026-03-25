package com.freelancehub.freelancehub.user.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@SuppressWarnings("FieldMayBeFinal")
@Entity
@Table(name = "clients")
@DiscriminatorValue("CLIENT")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
public class Client extends User {



    @Column(length = 150)
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String companyDescription;

    private String website;

    @Column(nullable = false)
    private double rating = 0.0;

    public Client() {
        // Eagerly set role so the in-memory object is never missing it,
        // regardless of whether Hibernate reloads from DB or returns the
        // cached instance within the same transaction.
        setRole(Role.CLIENT);
    }
}