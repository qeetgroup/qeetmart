package com.qeetmart.auth.security;

import com.qeetmart.auth.entity.Role;
import com.qeetmart.auth.entity.UserCredential;
import java.util.Collection;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@Builder
public class CustomUserDetails implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private Role role;

    public static CustomUserDetails fromUser(UserCredential user) {
        return CustomUserDetails.builder()
            .id(user.getId())
            .email(user.getEmail())
            .password(user.getPasswordHash())
            .role(user.getRole())
            .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
