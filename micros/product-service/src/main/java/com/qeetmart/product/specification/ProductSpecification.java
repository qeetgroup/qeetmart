package com.qeetmart.product.specification;

import com.qeetmart.product.entity.Product;
import com.qeetmart.product.entity.ProductStatus;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> isNotDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
    }

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> categoryId == null
            ? cb.conjunction()
            : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Product> hasBrand(String brand) {
        return (root, query, cb) -> (brand == null || brand.isBlank())
            ? cb.conjunction()
            : cb.equal(cb.lower(root.get("brand")), brand.toLowerCase());
    }

    public static Specification<Product> hasStatus(ProductStatus status) {
        return (root, query, cb) -> status == null
            ? cb.conjunction()
            : cb.equal(root.get("status"), status);
    }

    public static Specification<Product> searchByNameOrBrand(String queryText) {
        return (root, query, cb) -> {
            String like = "%" + queryText.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("brand")), like)
            );
        };
    }
}
