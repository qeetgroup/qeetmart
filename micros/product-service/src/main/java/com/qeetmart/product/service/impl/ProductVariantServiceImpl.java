package com.qeetmart.product.service.impl;

import com.qeetmart.product.dto.request.ProductVariantCreateRequest;
import com.qeetmart.product.dto.request.ProductVariantUpdateRequest;
import com.qeetmart.product.dto.response.ProductVariantResponse;
import com.qeetmart.product.entity.Product;
import com.qeetmart.product.entity.ProductVariant;
import com.qeetmart.product.exception.ConflictException;
import com.qeetmart.product.exception.ResourceNotFoundException;
import com.qeetmart.product.repository.ProductRepository;
import com.qeetmart.product.repository.ProductVariantRepository;
import com.qeetmart.product.service.ProductVariantService;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ProductVariantResponse createVariant(Long productId, ProductVariantCreateRequest request) {
        Product product = getProductEntity(productId);
        validateSkuForCreate(request.getSku());

        ProductVariant variant = ProductVariant.builder()
            .product(product)
            .sku(request.getSku().trim())
            .color(request.getColor())
            .size(request.getSize())
            .additionalPrice(safeAdditionalPrice(request.getAdditionalPrice()))
            .build();

        return toResponse(productVariantRepository.save(variant));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getVariants(Long productId) {
        getProductEntity(productId);
        return productVariantRepository.findAllByProductId(productId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(Long productId, Long variantId, ProductVariantUpdateRequest request) {
        getProductEntity(productId);
        ProductVariant variant = productVariantRepository.findByIdAndProductId(variantId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        validateSkuForUpdate(request.getSku(), variantId);

        variant.setSku(request.getSku().trim());
        variant.setColor(request.getColor());
        variant.setSize(request.getSize());
        variant.setAdditionalPrice(safeAdditionalPrice(request.getAdditionalPrice()));

        return toResponse(productVariantRepository.save(variant));
    }

    @Override
    @Transactional
    public void deleteVariant(Long productId, Long variantId) {
        getProductEntity(productId);
        ProductVariant variant = productVariantRepository.findByIdAndProductId(variantId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));
        productVariantRepository.delete(variant);
    }

    private Product getProductEntity(Long productId) {
        return productRepository.findByIdAndIsDeletedFalse(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    private void validateSkuForCreate(String sku) {
        if (productVariantRepository.existsBySkuIgnoreCase(sku.trim())) {
            throw new ConflictException("Variant with SKU '" + sku + "' already exists");
        }
    }

    private void validateSkuForUpdate(String sku, Long variantId) {
        if (productVariantRepository.existsBySkuIgnoreCaseAndIdNot(sku.trim(), variantId)) {
            throw new ConflictException("Variant with SKU '" + sku + "' already exists");
        }
    }

    private BigDecimal safeAdditionalPrice(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private ProductVariantResponse toResponse(ProductVariant variant) {
        return ProductVariantResponse.builder()
            .id(variant.getId())
            .productId(variant.getProduct().getId())
            .sku(variant.getSku())
            .color(variant.getColor())
            .size(variant.getSize())
            .additionalPrice(variant.getAdditionalPrice())
            .createdAt(variant.getCreatedAt())
            .updatedAt(variant.getUpdatedAt())
            .build();
    }
}
