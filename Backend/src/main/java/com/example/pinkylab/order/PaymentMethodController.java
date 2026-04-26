package com.example.pinkylab.order;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.cart.dto.request.cart.PaymentMethodRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.PaymentMethodResponseDto;
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
public class PaymentMethodController {

    PaymentMethodService paymentMethodService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách các phương thức thanh toán", description = "Lấy danh sách có phân trang")
    @GetMapping(UrlConstant.PaymentMethod.GET_ALL_PAYMENT_METHODS)
    public ResponseEntity<RestData<PaginationResponseDto<PaymentMethodResponseDto>>> getAllPaymentMethods(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<PaymentMethodResponseDto> response = paymentMethodService.getAllPaymentMethods(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết phương thức thanh toán", description = "Tìm phương thức thanh toán theo ID")
    @GetMapping(UrlConstant.PaymentMethod.GET_PAYMENT_METHOD_BY_ID)
    public ResponseEntity<RestData<PaymentMethodResponseDto>> getPaymentMethodById(@PathVariable UUID id) {
        PaymentMethodResponseDto response = paymentMethodService.getPaymentMethodById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo phương thức thanh toán", description = "Admin tạo mới một phương thức thanh toán", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.PaymentMethod.CREATE_PAYMENT_METHOD)
    public ResponseEntity<RestData<PaymentMethodResponseDto>> createPaymentMethod(
            @Valid @RequestBody PaymentMethodRequestDto request) {
        PaymentMethodResponseDto response = paymentMethodService.createPaymentMethod(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật phương thức thanh toán", description = "Cập nhật thông tin của một phương thức thanh toán", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.PaymentMethod.UPDATE_PAYMENT_METHOD)
    public ResponseEntity<RestData<PaymentMethodResponseDto>> updatePaymentMethod(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentMethodRequestDto request) {
        PaymentMethodResponseDto response = paymentMethodService.updatePaymentMethod(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa phương thức thanh toán", description = "Xóa phương thức thanh toán khỏi hệ thống", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.PaymentMethod.DELETE_PAYMENT_METHOD)
    public ResponseEntity<RestData<CommonResponseDto>> deletePaymentMethod(@PathVariable UUID id) {
        CommonResponseDto response = paymentMethodService.deletePaymentMethod(id);
        return VsResponseUtil.success(response);
    }
}
