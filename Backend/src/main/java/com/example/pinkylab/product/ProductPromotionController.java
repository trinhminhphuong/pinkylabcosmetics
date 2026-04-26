package com.example.pinkylab.product;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.product.dto.request.promotion.CreatePromotionRequestDto;
import com.example.pinkylab.product.dto.request.promotion.UpdatePromotionRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.promotion.PromotionResponseDto;
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

import java.util.List;
import java.util.UUID;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductPromotionController {

    ProductPromotionService promotionService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách khuyến mãi của sản phẩm", description = "Lấy các khuyến mãi đang áp dụng hoặc từng áp dụng cho sản phẩm")
    @GetMapping(UrlConstant.ProductPromotion.GET_ALL_PROMOTIONS_BY_PRODUCT)
    public ResponseEntity<RestData<List<PromotionResponseDto>>> getPromotionsByProductId(
            @PathVariable UUID productId) {
        List<PromotionResponseDto> response = promotionService.getPromotionsByProductId(productId);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết khuyến mãi", description = "Lấy chi tiết khuyến mãi bằng ID")
    @GetMapping(UrlConstant.ProductPromotion.GET_PROMOTION_BY_ID)
    public ResponseEntity<RestData<PromotionResponseDto>> getPromotionById(@PathVariable UUID id) {
        PromotionResponseDto response = promotionService.getPromotionById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo khuyến mãi mới", description = "Admin tạo khuyến mãi cho sản phẩm. (Chỉ 1 khuyến mãi Active tại 1 thời điểm)", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.ProductPromotion.CREATE_PROMOTION)
    public ResponseEntity<RestData<PromotionResponseDto>> createPromotion(
            @PathVariable UUID productId,
            @Valid @RequestBody CreatePromotionRequestDto request) {
        PromotionResponseDto response = promotionService.createPromotion(productId, request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật khuyến mãi", description = "Cập nhật ngày giờ, giá trị, trạng thái active của khuyến mãi", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.ProductPromotion.UPDATE_PROMOTION)
    public ResponseEntity<RestData<PromotionResponseDto>> updatePromotion(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePromotionRequestDto request) {
        PromotionResponseDto response = promotionService.updatePromotion(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa khuyến mãi", description = "Admin chức năng xóa khuyến mãi", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.ProductPromotion.DELETE_PROMOTION)
    public ResponseEntity<RestData<CommonResponseDto>> deletePromotion(@PathVariable UUID id) {
        CommonResponseDto response = promotionService.deletePromotion(id);
        return VsResponseUtil.success(response);
    }
}
