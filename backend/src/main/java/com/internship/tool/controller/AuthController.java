package com.internship.tool.controller;

import com.internship.tool.config.JwtUtil;
import com.internship.tool.dto.AuthResponse;
import com.internship.tool.dto.LoginRequest;
import com.internship.tool.dto.RefreshTokenRequest;
import com.internship.tool.dto.RegisterRequest;
import com.internship.tool.entity.AppUser;
import com.internship.tool.entity.UserRole;
import com.internship.tool.repository.AppUserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        AppUser user = AppUser.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(request.role() == null ? UserRole.USER : request.role())
                .enabled(Boolean.TRUE)
                .build();

        AppUser savedUser = appUserRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.email().trim().toLowerCase(),
                    request.password()
            ));
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password", exception);
        }

        AppUser user = appUserRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String email;
        try {
            email = jwtUtil.extractUsername(request.refreshToken());
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token", exception);
        }

        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (!jwtUtil.isRefreshTokenValid(request.refreshToken(), user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        return ResponseEntity.ok(buildAuthResponse(user));
    }

    private AuthResponse buildAuthResponse(AppUser user) {
        return new AuthResponse(
                jwtUtil.generateAccessToken(user),
                jwtUtil.generateRefreshToken(user),
                "Bearer",
                jwtUtil.getAccessTokenExpirationMs(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );
    }
}
