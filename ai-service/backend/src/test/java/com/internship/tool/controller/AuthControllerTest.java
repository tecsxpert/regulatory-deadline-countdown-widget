package com.internship.tool.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.internship.tool.config.JwtUtil;
import com.internship.tool.dto.AuthResponse;
import com.internship.tool.dto.LoginRequest;
import com.internship.tool.dto.RefreshTokenRequest;
import com.internship.tool.dto.RegisterRequest;
import com.internship.tool.entity.AppUser;
import com.internship.tool.entity.UserRole;
import com.internship.tool.repository.AppUserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    private AppUser user;

    @BeforeEach
    void setUp() {
        user = AppUser.builder()
                .id(1L)
                .name("Bindu")
                .email("bindu@example.com")
                .password("encoded")
                .role(UserRole.USER)
                .enabled(Boolean.TRUE)
                .build();
    }

    @Test
    void registerShouldCreateUserWithDefaultRole() {
        RegisterRequest request = new RegisterRequest("Bindu", "bindu@example.com", "password123", null);
        when(appUserRepository.existsByEmailIgnoreCase("bindu@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(appUserRepository.save(any(AppUser.class))).thenReturn(user);
        when(jwtUtil.generateAccessToken(user)).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtUtil.getAccessTokenExpirationMs()).thenReturn(900000L);

        var responseEntity = authController.register(request);
        AuthResponse response = responseEntity.getBody();

        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
        assertEquals("access-token", response.accessToken());
        verify(appUserRepository).save(any(AppUser.class));
    }

    @Test
    void registerShouldRejectDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Bindu", "bindu@example.com", "password123", UserRole.ADMIN);
        when(appUserRepository.existsByEmailIgnoreCase("bindu@example.com")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> authController.register(request));

        assertEquals(HttpStatus.CONFLICT, HttpStatus.valueOf(exception.getStatusCode().value()));
    }

    @Test
    void loginShouldReturnTokensForValidUser() {
        LoginRequest request = new LoginRequest("bindu@example.com", "password123");
        when(appUserRepository.findByEmailIgnoreCase("bindu@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateAccessToken(user)).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtUtil.getAccessTokenExpirationMs()).thenReturn(900000L);

        AuthResponse response = authController.login(request).getBody();

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        assertEquals("refresh-token", response.refreshToken());
    }

    @Test
    void loginShouldRejectInvalidCredentials() {
        LoginRequest request = new LoginRequest("bindu@example.com", "wrong");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> authController.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, HttpStatus.valueOf(exception.getStatusCode().value()));
    }

    @Test
    void refreshShouldRejectInvalidToken() {
        RefreshTokenRequest request = new RefreshTokenRequest("bad-token");
        when(jwtUtil.extractUsername("bad-token")).thenThrow(new IllegalArgumentException("Invalid token"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> authController.refresh(request));

        assertEquals(HttpStatus.UNAUTHORIZED, HttpStatus.valueOf(exception.getStatusCode().value()));
    }
}
