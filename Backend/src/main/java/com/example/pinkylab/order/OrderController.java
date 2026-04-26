package com.example.pinkylab.order;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.order.dto.request.order.CreateOrderRequestDto;
import com.example.pinkylab.order.dto.request.order.UpdateOrderStatusRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.order.dto.response.order.OrderResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    // ==================== USER ====================

    @Operation(summary = "Lấy danh sách đơn hàng của tôi", description = "Lấy tất cả đơn hàng của tài khoản đang đăng nhập", security = @SecurityRequirement(name = "Bearer Token"))
    @GetMapping(UrlConstant.Order.GET_MY_ORDERS)
    public ResponseEntity<RestData<PaginationResponseDto<OrderResponseDto>>> getMyOrders(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<OrderResponseDto> response = orderService.getMyOrders(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Đặt hàng", description = "Tạo đơn hàng mới từ giỏ hàng hiện tại", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.Order.PLACE_ORDER)
    public ResponseEntity<RestData<OrderResponseDto>> placeOrder(@Valid @RequestBody CreateOrderRequestDto request) {
        OrderResponseDto response = orderService.placeOrder(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Huỷ đơn hàng", description = "Huỷ đơn hàng (chỉ áp dụng nếu đơn hàng đang ở trạng thái mới hoặc xử lý)", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Order.CANCEL_ORDER)
    public ResponseEntity<RestData<CommonResponseDto>> cancelOrder(@PathVariable UUID id) {
        CommonResponseDto response = orderService.cancelOrder(id);
        return VsResponseUtil.success(response);
    }

    // ==================== BOTH (USER/ADMIN) ====================

    @Operation(summary = "Xem chi tiết đơn hàng", description = "Lấy thông tin chi tiết một đơn hàng theo ID", security = @SecurityRequirement(name = "Bearer Token"))
    @GetMapping(UrlConstant.Order.GET_ORDER_BY_ID)
    public ResponseEntity<RestData<OrderResponseDto>> getOrderById(@PathVariable UUID id) {
        OrderResponseDto response = orderService.getOrderById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Lấy danh sách tất cả đơn hàng", description = "Dành cho Admin xem tất cả các đơn hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @GetMapping(UrlConstant.Order.GET_ALL_ORDERS)
    public ResponseEntity<RestData<PaginationResponseDto<OrderResponseDto>>> getAllOrders(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<OrderResponseDto> response = orderService.getAllOrders(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Cập nhật trạng thái đơn hàng", description = "Admin cập nhật trạng thái đơn hàng (ví dụ: đang giao, hoàn thành)", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Order.UPDATE_ORDER_STATUS)
    public ResponseEntity<RestData<OrderResponseDto>> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequestDto request) {
        OrderResponseDto response = orderService.updateOrderStatus(id, request);
        return VsResponseUtil.success(response);
    }
}
