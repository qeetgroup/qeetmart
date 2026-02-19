package com.qeetmart.product.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String sku;
    private String color;
    private String size;
    private BigDecimal additionalPrice;
    private Instant createdAt;
    private Instant updatedAt;
}
