package com.qeetmart.product.service.impl;

import com.qeetmart.product.dto.request.ProductCreateRequest;
import com.qeetmart.product.dto.request.ProductUpdateRequest;
import com.qeetmart.product.dto.response.PagedResponse;
import com.qeetmart.product.dto.response.ProductResponse;
import com.qeetmart.product.entity.Category;
import com.qeetmart.product.entity.Product;
import com.qeetmart.product.entity.ProductStatus;
import com.qeetmart.product.exception.BadRequestException;
import com.qeetmart.product.exception.ResourceNotFoundException;
import com.qeetmart.product.repository.CategoryRepository;
import com.qeetmart.product.repository.ProductRepository;
import com.qeetmart.product.service.ProductService;
import com.qeetmart.product.specification.ProductSpecification;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        Category category = getCategoryEntity(request.getCategoryId());

        Product product = Product.builder()
            .name(request.getName().trim())
            .description(request.getDescription())
            .brand(request.getBrand().trim())
            .category(category)
            .price(request.getPrice())
            .currency(request.getCurrency().trim())
            .status(request.getStatus())
            .build();

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProducts(Long categoryId, String brand, ProductStatus status, Pageable pageable) {
        Specification<Product> spec = Specification.where(ProductSpecification.isNotDeleted())
            .and(ProductSpecification.hasCategoryId(categoryId))
            .and(ProductSpecification.hasBrand(brand))
            .and(ProductSpecification.hasStatus(status));

        return PagedResponse.fromPage(productRepository.findAll(spec, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {
        return toResponse(getProductEntity(productId));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, ProductUpdateRequest request) {
        Product product = getProductEntity(productId);
        Category category = getCategoryEntity(request.getCategoryId());

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand().trim());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setCurrency(request.getCurrency().trim());
        product.setStatus(request.getStatus());

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = getProductEntity(productId);
        product.setDeleted(true);
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String query) {
        if (query == null || query.isBlank()) {
            throw new BadRequestException("Query parameter must not be empty");
        }

        Specification<Product> spec = Specification.where(ProductSpecification.isNotDeleted())
            .and(ProductSpecification.searchByNameOrBrand(query.trim()));

        return productRepository.findAll(spec).stream().map(this::toResponse).toList();
    }

    private Product getProductEntity(Long productId) {
        return productRepository.findByIdAndIsDeletedFalse(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    private Category getCategoryEntity(Long categoryId) {
        return categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
            .id(product.getId())
            .name(product.getName())
            .description(product.getDescription())
            .brand(product.getBrand())
            .categoryId(product.getCategory().getId())
            .price(product.getPrice())
            .currency(product.getCurrency())
            .status(product.getStatus())
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .deleted(product.isDeleted())
            .build();
    }
}
