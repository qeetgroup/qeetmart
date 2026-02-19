package com.qeetmart.user.service.impl;

import com.qeetmart.user.dto.request.AddressCreateRequest;
import com.qeetmart.user.dto.request.AddressUpdateRequest;
import com.qeetmart.user.dto.response.AddressResponse;
import com.qeetmart.user.entity.Address;
import com.qeetmart.user.exception.ResourceNotFoundException;
import com.qeetmart.user.mapper.UserMapper;
import com.qeetmart.user.repository.AddressRepository;
import com.qeetmart.user.repository.UserProfileRepository;
import com.qeetmart.user.service.AddressService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public AddressResponse create(Long userId, AddressCreateRequest request) {
        assertUserExists(userId);

        Address address = userMapper.toAddress(request, userId);
        boolean markAsDefault = Boolean.TRUE.equals(request.getIsDefault())
            || addressRepository.countByUserId(userId) == 0;

        if (markAsDefault) {
            addressRepository.clearDefaultForUser(userId);
            address.setIsDefault(true);
        }

        Address saved = addressRepository.save(address);
        return userMapper.toAddressResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getByUserId(Long userId) {
        assertUserExists(userId);
        return addressRepository.findByUserIdOrderByIdAsc(userId)
            .stream()
            .map(userMapper::toAddressResponse)
            .toList();
    }

    @Override
    @Transactional
    public AddressResponse update(Long userId, Long addressId, AddressUpdateRequest request) {
        assertUserExists(userId);

        Address existing = getExistingAddress(userId, addressId);
        userMapper.updateAddress(existing, request);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultForUserExcluding(userId, addressId);
            existing.setIsDefault(true);
        }

        Address saved = addressRepository.save(existing);
        return userMapper.toAddressResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long addressId) {
        assertUserExists(userId);

        Address existing = getExistingAddress(userId, addressId);
        boolean wasDefault = Boolean.TRUE.equals(existing.getIsDefault());

        addressRepository.delete(existing);

        if (wasDefault) {
            addressRepository.findFirstByUserIdOrderByIdAsc(userId).ifPresent(address -> {
                address.setIsDefault(true);
                addressRepository.save(address);
            });
        }
    }

    private void assertUserExists(Long userId) {
        if (!userProfileRepository.existsByUserId(userId)) {
            throw new ResourceNotFoundException("User profile not found for userId: " + userId);
        }
    }

    private Address getExistingAddress(Long userId, Long addressId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Address not found for userId: " + userId + " and addressId: " + addressId
            ));
    }
}
