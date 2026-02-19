package com.qeetmart.user.mapper;

import com.qeetmart.user.dto.request.AddressCreateRequest;
import com.qeetmart.user.dto.request.AddressUpdateRequest;
import com.qeetmart.user.dto.request.UserProfileCreateRequest;
import com.qeetmart.user.dto.request.UserProfileUpdateRequest;
import com.qeetmart.user.dto.response.AddressResponse;
import com.qeetmart.user.dto.response.UserProfileResponse;
import com.qeetmart.user.entity.Address;
import com.qeetmart.user.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfile toUserProfile(UserProfileCreateRequest request, Long userId) {
        return UserProfile.builder()
            .userId(userId)
            .name(request.getName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .build();
    }

    public void updateUserProfile(UserProfile profile, UserProfileUpdateRequest request) {
        profile.setName(request.getName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
    }

    public UserProfileResponse toUserProfileResponse(UserProfile userProfile) {
        return UserProfileResponse.builder()
            .id(userProfile.getId())
            .userId(userProfile.getUserId())
            .name(userProfile.getName())
            .email(userProfile.getEmail())
            .phone(userProfile.getPhone())
            .createdAt(userProfile.getCreatedAt())
            .updatedAt(userProfile.getUpdatedAt())
            .build();
    }

    public Address toAddress(AddressCreateRequest request, Long userId) {
        return Address.builder()
            .userId(userId)
            .street(request.getStreet())
            .city(request.getCity())
            .state(request.getState())
            .pincode(request.getPincode())
            .country(request.getCountry())
            .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
            .build();
    }

    public void updateAddress(Address address, AddressUpdateRequest request) {
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setCountry(request.getCountry());
        address.setIsDefault(request.getIsDefault());
    }

    public AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
            .id(address.getId())
            .userId(address.getUserId())
            .street(address.getStreet())
            .city(address.getCity())
            .state(address.getState())
            .pincode(address.getPincode())
            .country(address.getCountry())
            .isDefault(address.getIsDefault())
            .build();
    }
}
