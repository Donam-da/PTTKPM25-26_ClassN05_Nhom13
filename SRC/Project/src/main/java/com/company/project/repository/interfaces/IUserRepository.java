package com.company.project.repository.interfaces;

import java.util.Optional;
import com.company.project.domain.entities.User;
import com.company.project.domain.valueobjects.Email;

public interface IUserRepository {
    User save(User user);
    Optional<User> findById(String id);
    boolean existsByEmail(Email email);
}
