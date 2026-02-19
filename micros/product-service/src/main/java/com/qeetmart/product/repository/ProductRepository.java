package com.qeetmart.product.repository;

import com.qeetmart.product.entity.Product;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByIdAndIsDeletedFalse(Long id);

    boolean existsByCategoryIdAndIsDeletedFalse(Long categoryId);
}
