package com.example.pinkylab.order;

import com.example.pinkylab.cart.dto.request.cart.ShippingMethodRequestDto;
import com.example.pinkylab.cart.dto.response.cart.ShippingMethodResponseDto;
import com.example.pinkylab.cart.ShippingMethod;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface ShippingMethodMapper {

    ShippingMethodResponseDto toResponseDto(ShippingMethod shippingMethod);

    @Mapping(target = "id", ignore = true)
    ShippingMethod toEntity(ShippingMethodRequestDto request);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(ShippingMethodRequestDto request, @MappingTarget ShippingMethod shippingMethod);
}
