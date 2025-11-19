package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.UserRegistrationDto;
import com.smartinventory.model.Auth;
import com.smartinventory.model.User;
import com.smartinventory.repository.AuthRepository;
import com.smartinventory.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthRepository authRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDto registrationDto) {
        // Check if username already exists
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse("User with username \"" + registrationDto.getUsername() + "\" already exists."));
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse("User with email \"" + registrationDto.getEmail() + "\" already exists."));
        }

        try {
            // Create new user
            User newUser = new User();
            newUser.setUsername(registrationDto.getUsername());
            newUser.setEmail(registrationDto.getEmail());
            newUser.setFullName(registrationDto.getFullName());

            User savedUser = userRepository.save(newUser);

            // Create auth record with hashed password
            Auth newAuth = new Auth();
            newAuth.setUserId(savedUser.getId());
            newAuth.setUser(savedUser);
            newAuth.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
            newAuth.setPermissionsLevel(1);

            authRepository.save(newAuth);

            // Return success response
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("username", savedUser.getUsername());
            userData.put("email", savedUser.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse("User registered successfully", userData));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }
}
