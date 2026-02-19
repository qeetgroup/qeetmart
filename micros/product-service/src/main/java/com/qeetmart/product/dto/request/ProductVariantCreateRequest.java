package com.qeetmart.product.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductVariantCreateRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 100, message = "SKU must be at most 100 characters")
    private String sku;

    @Size(max = 50, message = "Color must be at most 50 characters")
    private String color;

    @Size(max = 50, message = "Size must be at most 50 characters")
    private String size;

    @DecimalMin(value = "0.0", inclusive = true, message = "Additional price must be non-negative")
    private BigDecimal additionalPrice;
}
