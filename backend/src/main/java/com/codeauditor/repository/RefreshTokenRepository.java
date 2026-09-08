package com.codeauditor.repository;

import com.codeauditor.entity.RefreshToken;
import com.codeauditor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);
    
    @Modifying
    void deleteByUser(User user);

    @Modifying
    @Query("update RefreshToken token set token.revoked = true where token.user = :user")
    void revokeByUser(@Param("user") User user);
}
