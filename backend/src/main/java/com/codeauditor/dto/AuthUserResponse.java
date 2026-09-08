package com.codeauditor.dto;

import com.codeauditor.entity.User;

public record AuthUserResponse(
        Long id,
        String username,
        String email
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}
