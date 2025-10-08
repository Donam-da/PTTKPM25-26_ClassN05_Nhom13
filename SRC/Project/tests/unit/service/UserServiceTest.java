package com.company.project.tests.unit.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.company.project.repository.implementations.UserRepositoryImpl;
import com.company.project.service.implementations.UserService;
import com.company.project.service.dto.CreateUserRequest;

public class UserServiceTest {
    @Test
    void createAndGetUser_ok() {
        var repo = new UserRepositoryImpl();
        var service = new UserService(repo);
        var dto = service.create(new CreateUserRequest("u1","a@b.com"));
        assertEquals("u1", dto.id());
        assertTrue(dto.active());
        var got = service.get("u1").orElseThrow();
        assertEquals("a@b.com", got.email());
    }
}
