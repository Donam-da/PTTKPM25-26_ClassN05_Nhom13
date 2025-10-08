package com.company.project.ui.controllers;

import java.util.Optional;
import com.company.project.service.interfaces.IUserService;
import com.company.project.service.dto.CreateUserRequest;
import com.company.project.service.dto.UserDto;

/**
 * Controller giả lập (không phụ thuộc framework). 
 * Trong thực tế, bạn sẽ chú thích @RestController/@GetMapping theo framework.
 */
public class UserController {
    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    // POST /users
    public UserDto create(CreateUserRequest req) {
        return userService.create(req);
    }

    // GET /users/{id}
    public Optional<UserDto> get(String id) {
        return userService.get(id);
    }
}
