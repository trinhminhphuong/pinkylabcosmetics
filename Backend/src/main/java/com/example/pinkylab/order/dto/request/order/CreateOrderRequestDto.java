package com.example.pinkylab.order.dto.request.order;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateOrderRequestDto {

    @Valid
    AddressDto billingAddress;

    @Valid
    AddressDto shippingAddress;

    String note;
}
