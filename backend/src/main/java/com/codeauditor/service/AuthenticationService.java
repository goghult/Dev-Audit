package com.codeauditor.service;

import com.codeauditor.dto.AuthResponse;
import com.codeauditor.dto.AuthUserResponse;
import com.codeauditor.dto.LoginRequest;
import com.codeauditor.dto.RefreshTokenRequest;
import com.codeauditor.dto.RegisterRequest;
import com.codeauditor.entity.RefreshToken;
import com.codeauditor.entity.User;
import com.codeauditor.exception.DuplicateResourceException;
import com.codeauditor.repository.RefreshTokenRepository;
import com.codeauditor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already in use");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already in use");
        }

        var user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);
        
        return getAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
        return getAuthResponse(user);
    }

    @SuppressWarnings("null")
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.refreshToken();
        
        return refreshTokenRepository.findByTokenAndRevokedFalse(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(this::getAuthResponse)
                .orElseThrow(() -> new RuntimeException("Refresh token is invalid!"));
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(refreshTokenRepository::revokeByUser);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    private AuthResponse getAuthResponse(User user) {
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        
        refreshTokenRepository.deleteByUser(user);
        
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiryDate(Instant.now().plusMillis(604800000)) // 7 days
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthResponse(jwtToken, refreshToken, "Bearer", 86400000, AuthUserResponse.from(user)); // 1 day
    }
}
