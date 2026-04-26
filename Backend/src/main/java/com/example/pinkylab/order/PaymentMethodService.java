package com.example.pinkylab.order;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.cart.dto.request.cart.PaymentMethodRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.PaymentMethodResponseDto;

import java.util.UUID;

public interface PaymentMethodService {

    PaginationResponseDto<PaymentMethodResponseDto> getAllPaymentMethods(PaginationRequestDto request);

    PaymentMethodResponseDto getPaymentMethodById(UUID id);

    PaymentMethodResponseDto createPaymentMethod(PaymentMethodRequestDto request);

    PaymentMethodResponseDto updatePaymentMethod(UUID id, PaymentMethodRequestDto request);

    CommonResponseDto deletePaymentMethod(UUID id);
}
