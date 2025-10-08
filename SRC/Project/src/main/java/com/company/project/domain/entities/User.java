package com.company.project.domain.entities;

import com.company.project.domain.valueobjects.Email;

public class User {
    private final String id;
    private Email email;
    private boolean active = true;

    public User(String id, Email email) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("id required");
        this.id = id;
        this.email = email;
    }

    public String getId() { return id; }
    public Email getEmail() { return email; }
    public boolean isActive() { return active; }

    public void deactivate() { this.active = false; }
}
