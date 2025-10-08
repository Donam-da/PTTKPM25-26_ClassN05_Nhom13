package com.company.project.tests.integration.repository;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.company.project.repository.implementations.UserRepositoryImpl;
import com.company.project.domain.entities.User;
import com.company.project.domain.valueobjects.Email;

public class UserRepositoryTest {
    @Test
    void saveAndFind_ok() {
        var repo = new UserRepositoryImpl();
        var u = new User("u1", new Email("a@b.com"));
        repo.save(u);
        var got = repo.findById("u1").orElseThrow();
        assertEquals("u1", got.getId());
    }
}
