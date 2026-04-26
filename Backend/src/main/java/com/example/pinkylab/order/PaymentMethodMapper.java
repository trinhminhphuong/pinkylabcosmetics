package com.example.pinkylab.order;

import com.example.pinkylab.cart.dto.request.cart.PaymentMethodRequestDto;
import com.example.pinkylab.cart.dto.response.cart.PaymentMethodResponseDto;
import com.example.pinkylab.cart.PaymentMethod;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface PaymentMethodMapper {

    PaymentMethodResponseDto toResponseDto(PaymentMethod paymentMethod);

    @Mapping(target = "id", ignore = true)
    PaymentMethod toEntity(PaymentMethodRequestDto request);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(PaymentMethodRequestDto request, @MappingTarget PaymentMethod paymentMethod);
}
