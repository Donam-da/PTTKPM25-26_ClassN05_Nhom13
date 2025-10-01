package com.company.project.repository.implementations;

import java.util.*;
import com.company.project.repository.interfaces.IUserRepository;
import com.company.project.domain.entities.User;
import com.company.project.domain.valueobjects.Email;

/**
 * Triển khai repository dạng in-memory để minh hoạ.
 * Thay thế bằng ORM/SQL/HTTP thực tế của dự án.
 */
public class UserRepositoryImpl implements IUserRepository {
    private final Map<String, User> db = new HashMap<>();

    @Override
    public User save(User user) {
        db.put(user.getId(), user);
        return user;
    }

    @Override
    public Optional<User> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    @Override
    public boolean existsByEmail(Email email) {
        return db.values().stream().anyMatch(u -> u.getEmail().equals(email));
    }
}
