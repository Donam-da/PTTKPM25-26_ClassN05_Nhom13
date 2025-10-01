package com.company.project.domain.valueobjects;

public record Email(String value) {
    public Email {
        if (value == null || !value.matches("^[^@\s]+@[^@\s]+\.[^@\s]+$")) {
            throw new IllegalArgumentException("Invalid email");
        }
    }
}
