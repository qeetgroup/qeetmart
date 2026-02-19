package com.qeetmart.user.dto.response;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Instant createdAt;
    private Instant updatedAt;
}
