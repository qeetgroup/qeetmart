package com.qeetmart.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressUpdateRequest {

    @NotBlank(message = "street is required")
    @Size(max = 255, message = "street must be at most 255 characters")
    private String street;

    @NotBlank(message = "city is required")
    @Size(max = 120, message = "city must be at most 120 characters")
    private String city;

    @NotBlank(message = "state is required")
    @Size(max = 120, message = "state must be at most 120 characters")
    private String state;

    @NotBlank(message = "pincode is required")
    @Size(max = 20, message = "pincode must be at most 20 characters")
    private String pincode;

    @NotBlank(message = "country is required")
    @Size(max = 120, message = "country must be at most 120 characters")
    private String country;

    @NotNull(message = "isDefault is required")
    private Boolean isDefault;
}
