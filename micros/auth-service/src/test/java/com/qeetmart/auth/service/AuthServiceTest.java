package com.qeetmart.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qeetmart.auth.dto.request.RegisterRequest;
import com.qeetmart.auth.dto.response.AuthResponse;
import com.qeetmart.auth.entity.Role;
import com.qeetmart.auth.entity.UserCredential;
import com.qeetmart.auth.repository.UserCredentialRepository;
import com.qeetmart.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserCredentialRepository userCredentialRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerAlwaysCreatesUserRole() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setPassword("Password@123");

        when(userCredentialRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed-password");
        when(userCredentialRepository.save(any(UserCredential.class))).thenAnswer(invocation -> {
            UserCredential user = invocation.getArgument(0, UserCredential.class);
            user.setId(100L);
            return user;
        });
        when(jwtService.generateAccessToken(any(UserCredential.class))).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(any(UserCredential.class))).thenReturn("refresh-token");
        when(jwtService.getAccessTokenExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.register(request);

        ArgumentCaptor<UserCredential> captor = ArgumentCaptor.forClass(UserCredential.class);
        verify(userCredentialRepository).save(captor.capture());

        assertEquals(Role.USER, captor.getValue().getRole());
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(900L, response.getExpiresIn());
    }
}
