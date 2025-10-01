package com.company.project.service.validators;

import com.company.project.service.dto.CreateUserRequest;

public class UserValidator {
    public static void validate(CreateUserRequest req) {
        if (req == null) throw new IllegalArgumentException("Request is null");
        if (req.id() == null || req.id().isBlank()) throw new IllegalArgumentException("id required");
        if (req.email() == null || req.email().isBlank()) throw new IllegalArgumentException("email required");
    }
}
