package com.company.project.service.implementations;

import java.util.Optional;

import com.company.project.repository.interfaces.IUserRepository;
import com.company.project.service.interfaces.IUserService;
import com.company.project.service.dto.CreateUserRequest;
import com.company.project.service.dto.UserDto;
import com.company.project.service.validators.UserValidator;
import com.company.project.domain.entities.User;
import com.company.project.domain.valueobjects.Email;

public class UserService implements IUserService {
    private final IUserRepository repo;

    public UserService(IUserRepository repo) { this.repo = repo; }

    @Override
    public UserDto create(CreateUserRequest req) {
        UserValidator.validate(req);
        var user = new User(req.id(), new Email(req.email()));
        if (repo.existsByEmail(user.getEmail())) throw new IllegalStateException("Duplicated email");
        var saved = repo.save(user);
        return new UserDto(saved.getId(), saved.getEmail().value(), saved.isActive());
    }

    @Override
    public Optional<UserDto> get(String id) {
        return repo.findById(id).map(u -> new UserDto(u.getId(), u.getEmail().value(), u.isActive()));
    }
}
