package com.qeetmart.product.service;

import com.qeetmart.product.dto.request.CategoryCreateRequest;
import com.qeetmart.product.dto.request.CategoryUpdateRequest;
import com.qeetmart.product.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryCreateRequest request);

    List<CategoryResponse> getCategories();

    CategoryResponse getCategoryById(Long categoryId);

    CategoryResponse updateCategory(Long categoryId, CategoryUpdateRequest request);

    void deleteCategory(Long categoryId);
}
