package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.web.dto.request.testimonial.CreateTestimonialRequestDto;
import com.example.pinkylab.shared.web.dto.request.testimonial.UpdateTestimonialRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.shared.web.dto.response.testimonial.TestimonialResponseDto;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ClientTestimonialController {

    ClientTestimonialService testimonialService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách đánh giá từ khách hàng", description = "Lấy danh sách đánh giá từ khách hàng có phân trang")
    @GetMapping(UrlConstant.ClientTestimonial.GET_ALL_TESTIMONIALS)
    public ResponseEntity<RestData<PaginationResponseDto<TestimonialResponseDto>>> getAllTestimonials(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<TestimonialResponseDto> response = testimonialService.getAllTestimonials(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết đánh giá", description = "Lấy thông tin chi tiết của một đánh giá bằng ID")
    @GetMapping(UrlConstant.ClientTestimonial.GET_TESTIMONIAL_BY_ID)
    public ResponseEntity<RestData<TestimonialResponseDto>> getTestimonialById(@PathVariable UUID id) {
        TestimonialResponseDto response = testimonialService.getTestimonialById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo đánh giá mới", description = "Dùng để tạo một đánh giá mới từ khách hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.ClientTestimonial.CREATE_TESTIMONIAL)
    public ResponseEntity<RestData<TestimonialResponseDto>> createTestimonial(
            @Valid @RequestBody CreateTestimonialRequestDto request) {
        TestimonialResponseDto response = testimonialService.createTestimonial(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật avatar đánh giá", description = "Dùng để tải lên hoặc cập nhật hình ảnh avatar của khách hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.ClientTestimonial.UPDATE_TESTIMONIAL_AVATAR)
    public ResponseEntity<RestData<TestimonialResponseDto>> uploadAvatar(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        TestimonialResponseDto response = testimonialService.uploadAvatar(id, file);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Cập nhật đánh giá", description = "Dùng để cập nhật nội dung đánh giá", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.ClientTestimonial.UPDATE_TESTIMONIAL)
    public ResponseEntity<RestData<TestimonialResponseDto>> updateTestimonial(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTestimonialRequestDto request) {
        TestimonialResponseDto response = testimonialService.updateTestimonial(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa đánh giá", description = "Dùng để xóa một đánh giá của khách hàng", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.ClientTestimonial.DELETE_TESTIMONIAL)
    public ResponseEntity<RestData<CommonResponseDto>> deleteTestimonial(@PathVariable UUID id) {
        CommonResponseDto response = testimonialService.deleteTestimonial(id);
        return VsResponseUtil.success(response);
    }
}
