package com.qeetmart.product.service;

import com.qeetmart.product.dto.request.ProductCreateRequest;
import com.qeetmart.product.dto.request.ProductUpdateRequest;
import com.qeetmart.product.dto.response.PagedResponse;
import com.qeetmart.product.dto.response.ProductResponse;
import com.qeetmart.product.entity.ProductStatus;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    ProductResponse createProduct(ProductCreateRequest request);

    PagedResponse<ProductResponse> getProducts(Long categoryId, String brand, ProductStatus status, Pageable pageable);

    ProductResponse getProductById(Long productId);

    ProductResponse updateProduct(Long productId, ProductUpdateRequest request);

    void deleteProduct(Long productId);

    List<ProductResponse> searchProducts(String query);
}
