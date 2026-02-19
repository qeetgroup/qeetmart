package com.qeetmart.auth.dto.response;

import com.qeetmart.auth.entity.Role;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserMeResponse {

    private Long id;
    private String email;
    private Role role;
    private Instant createdAt;
    private Instant updatedAt;
}
