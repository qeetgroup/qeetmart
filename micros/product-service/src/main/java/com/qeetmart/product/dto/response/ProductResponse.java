package com.qeetmart.product.dto.response;

import com.qeetmart.product.entity.ProductStatus;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String brand;
    private Long categoryId;
    private BigDecimal price;
    private String currency;
    private ProductStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean deleted;
}
