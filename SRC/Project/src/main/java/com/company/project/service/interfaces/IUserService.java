package com.company.project.service.interfaces;

import java.util.Optional;
import com.company.project.service.dto.CreateUserRequest;
import com.company.project.service.dto.UserDto;

public interface IUserService {
    UserDto create(CreateUserRequest req);
    Optional<UserDto> get(String id);
}
