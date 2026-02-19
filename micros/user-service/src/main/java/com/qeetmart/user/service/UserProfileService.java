package com.qeetmart.user.service;

import com.qeetmart.user.dto.request.UserProfileCreateRequest;
import com.qeetmart.user.dto.request.UserProfileUpdateRequest;
import com.qeetmart.user.dto.response.PagedResponse;
import com.qeetmart.user.dto.response.UserProfileResponse;
import org.springframework.security.core.Authentication;

public interface UserProfileService {

    UserProfileResponse create(UserProfileCreateRequest request, Authentication authentication);

    UserProfileResponse getByUserId(Long userId);

    UserProfileResponse update(Long userId, UserProfileUpdateRequest request, Authentication authentication);

    void delete(Long userId);

    PagedResponse<UserProfileResponse> getAll(int page, int size, String sortBy, String sortDir);
}
