package com.qeetmart.user.service.impl;

import com.qeetmart.user.dto.request.UserProfileCreateRequest;
import com.qeetmart.user.dto.request.UserProfileUpdateRequest;
import com.qeetmart.user.dto.response.PagedResponse;
import com.qeetmart.user.dto.response.UserProfileResponse;
import com.qeetmart.user.entity.UserProfile;
import com.qeetmart.user.exception.BadRequestException;
import com.qeetmart.user.exception.ConflictException;
import com.qeetmart.user.exception.ResourceNotFoundException;
import com.qeetmart.user.mapper.UserMapper;
import com.qeetmart.user.repository.AddressRepository;
import com.qeetmart.user.repository.UserProfileRepository;
import com.qeetmart.user.security.AuthorizationService;
import com.qeetmart.user.security.JwtClaimService;
import com.qeetmart.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final AddressRepository addressRepository;
    private final UserMapper userMapper;
    private final JwtClaimService jwtClaimService;
    private final AuthorizationService authorizationService;

    @Override
    @Transactional
    public UserProfileResponse create(UserProfileCreateRequest request, Authentication authentication) {
        Long tokenUserId = jwtClaimService.getUserId(authentication);
        String tokenEmail = jwtClaimService.getEmail(authentication);

        if (userProfileRepository.existsByUserId(tokenUserId)) {
            throw new ConflictException("User profile already exists for userId: " + tokenUserId);
        }

        if (!authorizationService.isAdmin(authentication)
            && tokenEmail != null
            && !tokenEmail.equalsIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email in payload must match token email");
        }

        if (userProfileRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("User profile already exists for email: " + request.getEmail());
        }

        UserProfile profile = userMapper.toUserProfile(request, tokenUserId);
        UserProfile saved = userProfileRepository.save(profile);
        return userMapper.toUserProfileResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getByUserId(Long userId) {
        return userMapper.toUserProfileResponse(getExistingByUserId(userId));
    }

    @Override
    @Transactional
    public UserProfileResponse update(Long userId, UserProfileUpdateRequest request, Authentication authentication) {
        UserProfile existing = getExistingByUserId(userId);

        if (!existing.getEmail().equalsIgnoreCase(request.getEmail())
            && userProfileRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists: " + request.getEmail());
        }

        if (!authorizationService.isAdmin(authentication)) {
            String tokenEmail = jwtClaimService.getEmail(authentication);
            if (tokenEmail != null && !tokenEmail.equalsIgnoreCase(request.getEmail())) {
                throw new BadRequestException("Email in payload must match token email");
            }
        }

        userMapper.updateUserProfile(existing, request);
        UserProfile updated = userProfileRepository.save(existing);
        return userMapper.toUserProfileResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long userId) {
        UserProfile existing = getExistingByUserId(userId);
        addressRepository.deleteByUserId(userId);
        userProfileRepository.delete(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserProfileResponse> getAll(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDir);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("sortDir must be either 'asc' or 'desc'");
        }

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<UserProfileResponse> mappedPage = userProfileRepository.findAll(pageRequest)
            .map(userMapper::toUserProfileResponse);
        return PagedResponse.fromPage(mappedPage);
    }

    private UserProfile getExistingByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User profile not found for userId: " + userId));
    }
}
