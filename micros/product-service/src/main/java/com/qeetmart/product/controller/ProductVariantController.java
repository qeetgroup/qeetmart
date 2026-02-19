package com.qeetmart.product.controller;

import com.qeetmart.product.dto.request.ProductVariantCreateRequest;
import com.qeetmart.product.dto.request.ProductVariantUpdateRequest;
import com.qeetmart.product.dto.response.ApiResponse;
import com.qeetmart.product.dto.response.ProductVariantResponse;
import com.qeetmart.product.service.ProductVariantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/products/{productId}/variants")
@RequiredArgsConstructor
@Tag(name = "Variant APIs", description = "Product variant endpoints")
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create product variant")
    public ResponseEntity<ProductVariantResponse> createVariant(
        @PathVariable Long productId,
        @Valid @RequestBody ProductVariantCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productVariantService.createVariant(productId, request));
    }

    @GetMapping
    @Operation(summary = "Get product variants")
    public ResponseEntity<List<ProductVariantResponse>> getVariants(@PathVariable Long productId) {
        return ResponseEntity.ok(productVariantService.getVariants(productId));
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product variant")
    public ResponseEntity<ProductVariantResponse> updateVariant(
        @PathVariable Long productId,
        @PathVariable Long variantId,
        @Valid @RequestBody ProductVariantUpdateRequest request
    ) {
        return ResponseEntity.ok(productVariantService.updateVariant(productId, variantId, request));
    }

    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product variant")
    public ResponseEntity<ApiResponse> deleteVariant(@PathVariable Long productId, @PathVariable Long variantId) {
        productVariantService.deleteVariant(productId, variantId);
        return ResponseEntity.ok(ApiResponse.builder().message("Variant deleted successfully").build());
    }
}
