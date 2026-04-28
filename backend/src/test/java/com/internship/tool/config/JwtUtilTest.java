package com.internship.tool.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.internship.tool.entity.AppUser;
import com.internship.tool.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private AppUser user;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("very-secure-secret-key-for-tool87-tests", 60_000L, 120_000L);
        user = AppUser.builder()
                .id(1L)
                .name("Bindu")
                .email("bindu@example.com")
                .password("encoded-password")
                .role(UserRole.ADMIN)
                .enabled(Boolean.TRUE)
                .build();
    }

    @Test
    void generateAccessTokenShouldContainUsername() {
        String token = jwtUtil.generateAccessToken(user);

        assertEquals("bindu@example.com", jwtUtil.extractUsername(token));
    }

    @Test
    void accessTokenShouldBeValidForMatchingUser() {
        String token = jwtUtil.generateAccessToken(user);

        assertTrue(jwtUtil.isAccessTokenValid(token, user));
    }

    @Test
    void refreshTokenShouldNotBeValidAsAccessToken() {
        String refreshToken = jwtUtil.generateRefreshToken(user);

        assertFalse(jwtUtil.isAccessTokenValid(refreshToken, user));
        assertTrue(jwtUtil.isRefreshTokenValid(refreshToken, user));
    }

    @Test
    void generatedTokensShouldDifferByType() {
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        assertNotEquals(accessToken, refreshToken);
    }
}
