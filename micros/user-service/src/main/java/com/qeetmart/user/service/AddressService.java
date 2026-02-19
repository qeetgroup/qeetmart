package com.qeetmart.user.service;

import com.qeetmart.user.dto.request.AddressCreateRequest;
import com.qeetmart.user.dto.request.AddressUpdateRequest;
import com.qeetmart.user.dto.response.AddressResponse;
import java.util.List;

public interface AddressService {

    AddressResponse create(Long userId, AddressCreateRequest request);

    List<AddressResponse> getByUserId(Long userId);

    AddressResponse update(Long userId, Long addressId, AddressUpdateRequest request);

    void delete(Long userId, Long addressId);
}
