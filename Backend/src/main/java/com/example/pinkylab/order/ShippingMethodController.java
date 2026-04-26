package com.example.pinkylab.order;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.cart.dto.request.cart.ShippingMethodRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.ShippingMethodResponseDto;
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
public class ShippingMethodController {

    ShippingMethodService shippingMethodService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách các phương thức giao hàng", description = "Lấy danh sách có phân trang")
    @GetMapping(UrlConstant.ShippingMethod.GET_ALL_SHIPPING_METHODS)
    public ResponseEntity<RestData<PaginationResponseDto<ShippingMethodResponseDto>>> getAllShippingMethods(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<ShippingMethodResponseDto> response = shippingMethodService
                .getAllShippingMethods(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết phương thức giao hàng", description = "Tìm phương thức giao hàng theo ID")
    @GetMapping(UrlConstant.ShippingMethod.GET_SHIPPING_METHOD_BY_ID)
    public ResponseEntity<RestData<ShippingMethodResponseDto>> getShippingMethodById(@PathVariable UUID id) {
        ShippingMethodResponseDto response = shippingMethodService.getShippingMethodById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo phương thức giao hàng", description = "Admin tạo mới một phương thức giao hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.ShippingMethod.CREATE_SHIPPING_METHOD)
    public ResponseEntity<RestData<ShippingMethodResponseDto>> createShippingMethod(
            @Valid @RequestBody ShippingMethodRequestDto request) {
        ShippingMethodResponseDto response = shippingMethodService.createShippingMethod(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật phương thức giao hàng", description = "Cập nhật thông tin của một phương thức giao hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.ShippingMethod.UPDATE_SHIPPING_METHOD)
    public ResponseEntity<RestData<ShippingMethodResponseDto>> updateShippingMethod(
            @PathVariable UUID id,
            @Valid @RequestBody ShippingMethodRequestDto request) {
        ShippingMethodResponseDto response = shippingMethodService.updateShippingMethod(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa phương thức giao hàng", description = "Xóa phương thức giao hàng khỏi hệ thống", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.ShippingMethod.DELETE_SHIPPING_METHOD)
    public ResponseEntity<RestData<CommonResponseDto>> deleteShippingMethod(@PathVariable UUID id) {
        CommonResponseDto response = shippingMethodService.deleteShippingMethod(id);
        return VsResponseUtil.success(response);
    }
}
