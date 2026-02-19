package com.qeetmart.product.service;

import com.qeetmart.product.dto.request.ProductVariantCreateRequest;
import com.qeetmart.product.dto.request.ProductVariantUpdateRequest;
import com.qeetmart.product.dto.response.ProductVariantResponse;
import java.util.List;

public interface ProductVariantService {

    ProductVariantResponse createVariant(Long productId, ProductVariantCreateRequest request);

    List<ProductVariantResponse> getVariants(Long productId);

    ProductVariantResponse updateVariant(Long productId, Long variantId, ProductVariantUpdateRequest request);

    void deleteVariant(Long productId, Long variantId);
}
