package com.qeetmart.product.controller;

import com.qeetmart.product.dto.request.ProductCreateRequest;
import com.qeetmart.product.dto.request.ProductUpdateRequest;
import com.qeetmart.product.dto.response.ApiResponse;
import com.qeetmart.product.dto.response.PagedResponse;
import com.qeetmart.product.dto.response.ProductResponse;
import com.qeetmart.product.entity.ProductStatus;
import com.qeetmart.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Product APIs", description = "Product management endpoints")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create product")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @GetMapping
    @Operation(summary = "Get products with pagination and filters")
    public ResponseEntity<PagedResponse<ProductResponse>> getProducts(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) ProductStatus status,
        @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(productService.getProducts(categoryId, brand, status, pageable));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product")
    public ResponseEntity<ProductResponse> updateProduct(
        @PathVariable Long productId,
        @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete product")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.builder().message("Product deleted successfully").build());
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by name or brand")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }
}
