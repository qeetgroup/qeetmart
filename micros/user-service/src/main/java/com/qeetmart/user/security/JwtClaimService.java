package com.qeetmart.user.security;

import com.qeetmart.user.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class JwtClaimService {

    public Long getUserId(Authentication authentication) {
        Object claim = extractJwt(authentication).getClaims().get("userId");
        if (claim == null) {
            throw new UnauthorizedException("Missing userId claim in token");
        }
        if (claim instanceof Integer value) {
            return value.longValue();
        }
        if (claim instanceof Long value) {
            return value;
        }
        if (claim instanceof String value) {
            return Long.parseLong(value);
        }
        throw new UnauthorizedException("Invalid userId claim in token");
    }

    public String getEmail(Authentication authentication) {
        Jwt jwt = extractJwt(authentication);
        String email = jwt.getClaimAsString("email");
        return email != null ? email : jwt.getSubject();
    }

    private Jwt extractJwt(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return jwtAuthenticationToken.getToken();
        }
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }
        throw new UnauthorizedException("Missing or invalid authentication token");
    }
}
