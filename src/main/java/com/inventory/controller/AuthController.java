package com.inventory.controller;

import com.inventory.dto.RegisterRequest;
import com.inventory.model.Auth;
import com.inventory.model.User;
import com.inventory.repository.AuthRepository;
import com.inventory.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final AuthRepository authRepository;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            response.put("message", "User with username \"" + request.getUsername() + "\" already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            response.put("message", "User with email \"" + request.getEmail() + "\" already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        try {
            // Create new user
            User newUser = new User();
            newUser.setUsername(request.getUsername());
            newUser.setEmail(request.getEmail());
            newUser.setFullName(request.getFullName());
            newUser = userRepository.save(newUser);

            // Create auth record
            Auth newAuth = new Auth();
            newAuth.setUser(newUser);
            newAuth.setPassword(request.getPassword());
            authRepository.save(newAuth);

            // Build success response
            response.put("message", "User registered successfully");
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", newUser.getId());
            userInfo.put("username", newUser.getUsername());
            userInfo.put("email", newUser.getEmail());
            response.put("user", userInfo);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("message", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
