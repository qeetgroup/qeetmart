package com.qeetmart.user.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component("authorizationService")
@RequiredArgsConstructor
public class AuthorizationService {

    private final JwtClaimService jwtClaimService;

    public boolean canAccessUser(Authentication authentication, Long userId) {
        if (authentication == null || userId == null) {
            return false;
        }
        return isAdmin(authentication) || userId.equals(jwtClaimService.getUserId(authentication));
    }

    public boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch("ROLE_ADMIN"::equals);
    }
}
