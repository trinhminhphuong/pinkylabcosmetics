package com.example.pinkylab.news;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.category.NewsCategoryRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.category.NewsCategoryCountDto;
import com.example.pinkylab.news.dto.response.category.NewsCategoryResponseDto;
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
public class NewsCategoryController {

    NewsCategoryService newsCategoryService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách các danh mục tin tức", description = "Lấy danh sách có phân trang")
    @GetMapping(UrlConstant.NewsCategory.GET_ALL_CATEGORIES)
    public ResponseEntity<RestData<PaginationResponseDto<NewsCategoryResponseDto>>> getAllCategories(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<NewsCategoryResponseDto> response = newsCategoryService.getAllCategories(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết danh mục", description = "Tìm danh mục theo ID")
    @GetMapping(UrlConstant.NewsCategory.GET_CATEGORY_BY_ID)
    public ResponseEntity<RestData<NewsCategoryResponseDto>> getCategoryById(@PathVariable UUID id) {
        NewsCategoryResponseDto response = newsCategoryService.getCategoryById(id);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Đếm bài viết theo danh mục", description = "Thống kê số lượng bài viết của từng danh mục và sắp xếp giảm dần theo số lượng")
    @GetMapping(UrlConstant.NewsCategory.GET_CATEGORY_COUNTS)
    public ResponseEntity<RestData<List<NewsCategoryCountDto>>> getCategoryCounts() {
        List<NewsCategoryCountDto> response = newsCategoryService.getCategoryCounts();
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo danh mục tin tức", description = "Admin tạo mới một danh mục", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.NewsCategory.CREATE_CATEGORY)
    public ResponseEntity<RestData<NewsCategoryResponseDto>> createCategory(
            @Valid @RequestBody NewsCategoryRequestDto request) {
        NewsCategoryResponseDto response = newsCategoryService.createCategory(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật danh mục tin tức", description = "Cập nhật thông tin của một danh mục", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.NewsCategory.UPDATE_CATEGORY)
    public ResponseEntity<RestData<NewsCategoryResponseDto>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody NewsCategoryRequestDto request) {
        NewsCategoryResponseDto response = newsCategoryService.updateCategory(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa danh mục tin tức", description = "Xóa danh mục tin tức khỏi hệ thống", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.NewsCategory.DELETE_CATEGORY)
    public ResponseEntity<RestData<CommonResponseDto>> deleteCategory(@PathVariable UUID id) {
        CommonResponseDto response = newsCategoryService.deleteCategory(id);
        return VsResponseUtil.success(response);
    }
}
