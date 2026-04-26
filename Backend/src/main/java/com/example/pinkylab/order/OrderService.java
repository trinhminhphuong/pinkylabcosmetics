package com.example.pinkylab.order;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.order.dto.request.order.CreateOrderRequestDto;
import com.example.pinkylab.order.dto.request.order.UpdateOrderStatusRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.order.dto.response.order.OrderResponseDto;

import java.util.UUID;

public interface OrderService {

    OrderResponseDto placeOrder(CreateOrderRequestDto request);

    PaginationResponseDto<OrderResponseDto> getMyOrders(PaginationRequestDto request);

    PaginationResponseDto<OrderResponseDto> getAllOrders(PaginationRequestDto request);

    OrderResponseDto getOrderById(UUID id);

    OrderResponseDto updateOrderStatus(UUID id, UpdateOrderStatusRequestDto request);

    CommonResponseDto cancelOrder(UUID id);
}
