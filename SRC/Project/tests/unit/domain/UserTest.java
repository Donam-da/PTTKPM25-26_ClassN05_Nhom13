package com.company.project.tests.unit.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import com.company.project.domain.valueobjects.Email;
import com.company.project.domain.entities.User;

public class UserTest {
    @Test
    void createUser_ok() {
        var u = new User("u1", new Email("a@b.com"));
        assertTrue(u.isActive());
        assertEquals("u1", u.getId());
    }

    @Test
    void invalidEmail_throw() {
        assertThrows(IllegalArgumentException.class, () -> new Email("bad"));
    }
}
