package com.qeetmart.user.controller;

import com.qeetmart.user.dto.request.AddressCreateRequest;
import com.qeetmart.user.dto.request.AddressUpdateRequest;
import com.qeetmart.user.dto.response.AddressResponse;
import com.qeetmart.user.dto.response.ApiResponse;
import com.qeetmart.user.service.AddressService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/{userId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    @PreAuthorize("@authorizationService.canAccessUser(authentication, #userId)")
    public ResponseEntity<AddressResponse> createAddress(
        @PathVariable Long userId,
        @Valid @RequestBody AddressCreateRequest request
    ) {
        AddressResponse response = addressService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("@authorizationService.canAccessUser(authentication, #userId)")
    public ResponseEntity<List<AddressResponse>> getAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.getByUserId(userId));
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("@authorizationService.canAccessUser(authentication, #userId)")
    public ResponseEntity<AddressResponse> updateAddress(
        @PathVariable Long userId,
        @PathVariable Long addressId,
        @Valid @RequestBody AddressUpdateRequest request
    ) {
        return ResponseEntity.ok(addressService.update(userId, addressId, request));
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("@authorizationService.canAccessUser(authentication, #userId)")
    public ResponseEntity<ApiResponse> deleteAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        addressService.delete(userId, addressId);
        return ResponseEntity.ok(ApiResponse.builder().message("Address deleted successfully").build());
    }
}
