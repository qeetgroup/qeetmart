package com.qeetmart.product.repository;

import com.qeetmart.product.entity.ProductVariant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findAllByProductId(Long productId);

    Optional<ProductVariant> findByIdAndProductId(Long variantId, Long productId);

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);
}
