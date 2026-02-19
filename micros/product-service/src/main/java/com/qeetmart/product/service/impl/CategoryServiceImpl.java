package com.qeetmart.product.service.impl;

import com.qeetmart.product.dto.request.CategoryCreateRequest;
import com.qeetmart.product.dto.request.CategoryUpdateRequest;
import com.qeetmart.product.dto.response.CategoryResponse;
import com.qeetmart.product.entity.Category;
import com.qeetmart.product.exception.ConflictException;
import com.qeetmart.product.exception.ResourceNotFoundException;
import com.qeetmart.product.repository.CategoryRepository;
import com.qeetmart.product.repository.ProductRepository;
import com.qeetmart.product.service.CategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
            .name(request.getName().trim())
            .description(request.getDescription())
            .build();

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long categoryId) {
        return toResponse(getCategoryEntity(categoryId));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CategoryUpdateRequest request) {
        Category category = getCategoryEntity(categoryId);

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), categoryId)) {
            throw new ConflictException("Category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = getCategoryEntity(categoryId);
        if (productRepository.existsByCategoryIdAndIsDeletedFalse(categoryId)) {
            throw new ConflictException("Category cannot be deleted because active products are linked to it");
        }
        categoryRepository.delete(category);
    }

    private Category getCategoryEntity(Long categoryId) {
        return categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .createdAt(category.getCreatedAt())
            .updatedAt(category.getUpdatedAt())
            .build();
    }
}
