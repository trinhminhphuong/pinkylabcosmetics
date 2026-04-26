package com.example.pinkylab.order;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.cart.dto.request.cart.ShippingMethodRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.ShippingMethodResponseDto;

import java.util.UUID;

public interface ShippingMethodService {

    PaginationResponseDto<ShippingMethodResponseDto> getAllShippingMethods(PaginationRequestDto request);

    ShippingMethodResponseDto getShippingMethodById(UUID id);

    ShippingMethodResponseDto createShippingMethod(ShippingMethodRequestDto request);

    ShippingMethodResponseDto updateShippingMethod(UUID id, ShippingMethodRequestDto request);

    CommonResponseDto deleteShippingMethod(UUID id);
}
