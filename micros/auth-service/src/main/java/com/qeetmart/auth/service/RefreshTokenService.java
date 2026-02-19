package com.qeetmart.auth.service;

import com.qeetmart.auth.entity.RefreshToken;
import com.qeetmart.auth.entity.UserCredential;
import com.qeetmart.auth.exception.UnauthorizedException;
import com.qeetmart.auth.repository.RefreshTokenRepository;
import com.qeetmart.auth.security.JwtService;
import jakarta.transaction.Transactional;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public String createRefreshToken(UserCredential user) {
        String token = jwtService.generateRefreshToken(user);
        RefreshToken refreshToken = RefreshToken.builder()
            .userId(user.getId())
            .token(token)
            .expiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMs()))
            .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    public RefreshToken getByToken(String token) {
        return refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new UnauthorizedException("Refresh token is invalid"));
    }

    public void verifyNotExpired(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token has expired");
        }
    }

    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
