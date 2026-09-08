package com.codeauditor.service;

import com.codeauditor.dto.RegisterRequest;
import com.codeauditor.dto.RefreshTokenRequest;
import com.codeauditor.entity.RefreshToken;
import com.codeauditor.entity.User;
import com.codeauditor.repository.RefreshTokenRepository;
import com.codeauditor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService,
                authenticationManager);
    }

    @Test
    void registerRejectsExistingEmail() {
        RegisterRequest request = new RegisterRequest("alice", "alice@example.com", "password");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authenticationService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already in use");
    }

    @Test
    void registerRejectsExistingUsername() {
        RegisterRequest request = new RegisterRequest("alice", "alice@example.com", "password");
        when(userRepository.existsByUsername(request.username())).thenReturn(true);

        assertThatThrownBy(() -> authenticationService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Username already in use");
    }

    @Test
    void refreshTokenRejectsExpiredToken() {
        RefreshToken token = RefreshToken.builder()
                .token("expired")
                .expiryDate(Instant.now().minusSeconds(1))
                .build();
        when(refreshTokenRepository.findByTokenAndRevokedFalse("expired")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authenticationService.refreshToken(new RefreshTokenRequest("expired")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("expired");
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void refreshTokenRejectsRevokedToken() {
        when(refreshTokenRepository.findByTokenAndRevokedFalse("revoked"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.refreshToken(new RefreshTokenRequest("revoked")))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Refresh token is invalid!");
    }

    @Test
    void logoutRevokesAllRefreshTokensForUser() {
        User user = User.builder().email("alice@example.com").build();
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        authenticationService.logout(user.getEmail());

        verify(refreshTokenRepository).revokeByUser(user);
    }
}
