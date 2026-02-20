package com.qeetmart.auth.service;

import com.qeetmart.auth.dto.request.ChangePasswordRequest;
import com.qeetmart.auth.dto.request.LoginRequest;
import com.qeetmart.auth.dto.request.LogoutRequest;
import com.qeetmart.auth.dto.request.RefreshTokenRequest;
import com.qeetmart.auth.dto.request.RegisterRequest;
import com.qeetmart.auth.dto.response.ApiResponse;
import com.qeetmart.auth.dto.response.AuthResponse;
import com.qeetmart.auth.dto.response.UserMeResponse;
import com.qeetmart.auth.entity.RefreshToken;
import com.qeetmart.auth.entity.Role;
import com.qeetmart.auth.entity.UserCredential;
import com.qeetmart.auth.exception.BadRequestException;
import com.qeetmart.auth.exception.ResourceNotFoundException;
import com.qeetmart.auth.exception.UnauthorizedException;
import com.qeetmart.auth.repository.UserCredentialRepository;
import com.qeetmart.auth.security.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserCredentialRepository userCredentialRepository;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userCredentialRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        UserCredential user = UserCredential.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(Role.USER)
            .build();

        UserCredential savedUser = userCredentialRepository.save(user);
        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = refreshTokenService.createRefreshToken(savedUser);
        return toAuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }

        UserCredential user = userCredentialRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        refreshTokenService.deleteByUserId(user.getId());

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        return toAuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        try {
            if (!jwtService.isRefreshToken(token) || !jwtService.isTokenValid(token)) {
                throw new UnauthorizedException("Refresh token is invalid");
            }
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Refresh token is invalid");
        }

        RefreshToken storedToken = refreshTokenService.getByToken(token);
        refreshTokenService.verifyNotExpired(storedToken);

        Long tokenUserId = jwtService.extractUserId(token);
        if (!storedToken.getUserId().equals(tokenUserId)) {
            throw new UnauthorizedException("Refresh token user mismatch");
        }

        UserCredential user = userCredentialRepository.findById(tokenUserId)
            .orElseThrow(() -> new UnauthorizedException("User no longer exists"));

        refreshTokenService.deleteByToken(token);

        String accessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = refreshTokenService.createRefreshToken(user);
        return toAuthResponse(accessToken, newRefreshToken);
    }

    @Transactional
    public ApiResponse logout(LogoutRequest request) {
        refreshTokenService.deleteByToken(request.getRefreshToken());
        return new ApiResponse("Logged out successfully");
    }

    public UserMeResponse getCurrentUser(String email) {
        UserCredential user = userCredentialRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserMeResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .role(user.getRole())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }

    @Transactional
    public ApiResponse changePassword(String email, ChangePasswordRequest request) {
        UserCredential user = userCredentialRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Old password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userCredentialRepository.save(user);
        refreshTokenService.deleteByUserId(user.getId());
        return new ApiResponse("Password changed successfully");
    }

    private AuthResponse toAuthResponse(String accessToken, String refreshToken) {
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
            .build();
    }
}
