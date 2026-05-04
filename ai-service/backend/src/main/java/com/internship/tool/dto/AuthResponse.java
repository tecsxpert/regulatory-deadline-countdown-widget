package com.internship.tool.dto;

import com.internship.tool.entity.UserRole;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresInMs,
        String email,
        String name,
        UserRole role
) {
}
