package com.qeetmart.user.controller;

import com.qeetmart.user.dto.request.UserProfileCreateRequest;
import com.qeetmart.user.dto.request.UserProfileUpdateRequest;
import com.qeetmart.user.dto.response.ApiResponse;
import com.qeetmart.user.dto.response.PagedResponse;
import com.qeetmart.user.dto.response.UserProfileResponse;
import com.qeetmart.user.service.UserProfileService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserProfileService userProfileService;

    @PostMapping
    public ResponseEntity<UserProfileResponse> createUser(
        @Valid @RequestBody UserProfileCreateRequest request,
        Authentication authentication
    ) {
        UserProfileResponse response = userProfileService.create(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<UserProfileResponse>> getUsers(
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(userProfileService.getAll(page, size, sortBy, sortDir));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("@authorizationService.canAccessUser(authentication, #userId)")
    public ResponseEntity<UserProfileResponse> getUserByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(userProfileService.getByUserId(userId));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("@authorizationService.canAccessUser(authentication, #userId)")
    public ResponseEntity<UserProfileResponse> updateUser(
        @PathVariable Long userId,
        @Valid @RequestBody UserProfileUpdateRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(userProfileService.update(userId, request, authentication));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("@authorizationService.canAccessUser(authentication, #userId)")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long userId) {
        userProfileService.delete(userId);
        return ResponseEntity.ok(ApiResponse.builder().message("User profile deleted successfully").build());
    }
}
