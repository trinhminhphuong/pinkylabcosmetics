package com.example.pinkylab.product;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.review.CreateReviewRequestDto;
import com.example.pinkylab.product.dto.request.review.UpdateReviewRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.review.ReviewResponseDto;
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
public class ReviewController {

    ReviewService reviewService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách đánh giá của sản phẩm", description = "Tìm các đánh giá dựa theo ID sản phẩm")
    @GetMapping(UrlConstant.Review.GET_ALL_REVIEWS_BY_PRODUCT)
    public ResponseEntity<RestData<PaginationResponseDto<ReviewResponseDto>>> getReviewsByProductId(
            @PathVariable UUID productId,
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<ReviewResponseDto> response = reviewService.getReviewsByProductId(productId, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết đánh giá", description = "Lấy đánh giá dựa theo ID của đánh giá")
    @GetMapping(UrlConstant.Review.GET_REVIEW_BY_ID)
    public ResponseEntity<RestData<ReviewResponseDto>> getReviewById(@PathVariable UUID id) {
        ReviewResponseDto response = reviewService.getReviewById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== USER / ADMIN ====================

    @Operation(summary = "Tạo đánh giá mới cho sản phẩm", description = "Người dùng đánh giá sản phẩm sau khi mua", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.Review.CREATE_REVIEW)
    public ResponseEntity<RestData<ReviewResponseDto>> createReview(
            @PathVariable UUID productId,
            @Valid @RequestBody CreateReviewRequestDto request) {
        ReviewResponseDto response = reviewService.createReview(productId, request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật đánh giá", description = "Người dùng tự cập nhật đánh giá của mình", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Review.UPDATE_REVIEW)
    public ResponseEntity<RestData<ReviewResponseDto>> updateReview(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReviewRequestDto request) {
        ReviewResponseDto response = reviewService.updateReview(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa đánh giá", description = "Admin hoặc User có thể xóa đánh giá", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.Review.DELETE_REVIEW)
    public ResponseEntity<RestData<CommonResponseDto>> deleteReview(@PathVariable UUID id) {
        CommonResponseDto response = reviewService.deleteReview(id);
        return VsResponseUtil.success(response);
    }
}
