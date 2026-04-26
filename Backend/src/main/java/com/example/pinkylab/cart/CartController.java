package com.example.pinkylab.cart;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.cart.dto.request.cart.CartItemRequestDto;
import com.example.pinkylab.cart.dto.request.cart.UpdateCartItemRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.CartResponseDto;
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
public class CartController {

    CartService cartService;

    // ==================== USER ====================

    @Operation(summary = "Lấy giỏ hàng của tôi", description = "Lấy thông tin chi tiết giỏ hàng của user đang đăng nhập", security = @SecurityRequirement(name = "Bearer Token"))
    @GetMapping(UrlConstant.Cart.GET_MY_CART)
    public ResponseEntity<RestData<CartResponseDto>> getMyCart() {
        CartResponseDto response = cartService.getMyCart();
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Thêm sản phẩm vào giỏ hàng", description = "Bỏ sản phẩm vào giỏ", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.Cart.ADD_ITEM)
    public ResponseEntity<RestData<CartResponseDto>> addItem(@Valid @RequestBody CartItemRequestDto request) {
        CartResponseDto response = cartService.addItem(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật số lượng sản phẩm", description = "Thay đổi số lượng của item trong giỏ hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Cart.UPDATE_ITEM)
    public ResponseEntity<RestData<CartResponseDto>> updateItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequestDto request) {
        CartResponseDto response = cartService.updateItem(itemId, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa sản phẩm khỏi giỏ hàng", description = "Xóa 1 item khỏi giỏ", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.Cart.REMOVE_ITEM)
    public ResponseEntity<RestData<CommonResponseDto>> removeItem(@PathVariable UUID itemId) {
        CommonResponseDto response = cartService.removeItem(itemId);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Làm rỗng giỏ hàng", description = "Xóa tất cả các item trong giỏ", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.Cart.CLEAR_CART)
    public ResponseEntity<RestData<CommonResponseDto>> clearCart() {
        CommonResponseDto response = cartService.clearCart();
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Áp dụng mã giảm giá", description = "Chọn mã giảm giá cho giỏ hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Cart.APPLY_PROMOTION)
    public ResponseEntity<RestData<CartResponseDto>> applyPromotion(@PathVariable UUID promotionId) {
        CartResponseDto response = cartService.applyPromotion(promotionId);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Chọn phương thức giao hàng", description = "Chọn phương thức giao hàng cho giỏ hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Cart.SELECT_SHIPPING_METHOD)
    public ResponseEntity<RestData<CartResponseDto>> selectShippingMethod(@PathVariable UUID shippingMethodId) {
        CartResponseDto response = cartService.selectShippingMethod(shippingMethodId);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Chọn phương thức thanh toán", description = "Chọn phương thức thanh toán cho giỏ hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Cart.SELECT_PAYMENT_METHOD)
    public ResponseEntity<RestData<CartResponseDto>> selectPaymentMethod(@PathVariable UUID paymentMethodId) {
        CartResponseDto response = cartService.selectPaymentMethod(paymentMethodId);
        return VsResponseUtil.success(response);
    }
}
