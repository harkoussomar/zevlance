package com.freelancehub.freelancehub.user.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
@DiscriminatorValue("ADMIN")
@PrimaryKeyJoinColumn(name = "id")
public class Admin extends User {

    public Admin() { setRole(Role.ADMIN); }
}