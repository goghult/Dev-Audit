package com.codeauditor.service;

import io.jsonwebtoken.io.Encoders;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() throws NoSuchAlgorithmException {
        jwtService = new JwtService();
        KeyGenerator keyGenerator = KeyGenerator.getInstance("HmacSHA256");
        SecretKey key = keyGenerator.generateKey();
        ReflectionTestUtils.setField(jwtService, "secretKey", Encoders.BASE64.encode(key.getEncoded()));
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 60_000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 120_000L);
        user = new User("alice", "password", java.util.List.of());
    }

    @Test
    void generateTokenContainsUsernameAndIsValid() {
        String token = jwtService.generateToken(user);

        assertThat(jwtService.extractUsername(token)).isEqualTo("alice");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void tokenForDifferentUserIsInvalid() {
        String token = jwtService.generateToken(user);
        User otherUser = new User("bob", "password", java.util.List.of());

        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    void refreshTokenContainsUsername() {
        String token = jwtService.generateRefreshToken(user);

        assertThat(jwtService.extractUsername(token)).isEqualTo("alice");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }
}
