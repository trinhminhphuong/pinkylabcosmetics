package com.example.pinkylab.cart;

import com.example.pinkylab.cart.dto.request.cart.CartItemRequestDto;
import com.example.pinkylab.cart.dto.request.cart.UpdateCartItemRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.CartResponseDto;

import java.util.UUID;

public interface CartService {

    CartResponseDto getMyCart();

    CartResponseDto addItem(CartItemRequestDto request);

    CartResponseDto updateItem(UUID itemId, UpdateCartItemRequestDto request);

    CommonResponseDto removeItem(UUID itemId);

    CommonResponseDto clearCart();

    CartResponseDto applyPromotion(UUID promotionId);

    CartResponseDto selectShippingMethod(UUID shippingMethodId);

    CartResponseDto selectPaymentMethod(UUID paymentMethodId);
}
