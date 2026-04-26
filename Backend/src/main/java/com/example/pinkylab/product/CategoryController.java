package com.example.pinkylab.product;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.category.CreateCategoryRequestDto;
import com.example.pinkylab.product.dto.request.category.UpdateCategoryRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.category.CategoryResponseDto;
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
public class CategoryController {

    CategoryService categoryService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách tất cả danh mục", description = "Dùng để lấy danh sách tất cả danh mục sản phẩm có phân trang")
    @GetMapping(UrlConstant.Category.GET_ALL_CATEGORIES)
    public ResponseEntity<RestData<PaginationResponseDto<CategoryResponseDto>>> getAllCategories(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<CategoryResponseDto> response = categoryService.getAllCategories(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết danh mục theo ID", description = "Dùng để lấy thông tin chi tiết của một danh mục")
    @GetMapping(UrlConstant.Category.GET_CATEGORY_BY_ID)
    public ResponseEntity<RestData<CategoryResponseDto>> getCategoryById(@PathVariable UUID id) {
        CategoryResponseDto response = categoryService.getCategoryById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo danh mục mới", description = "Dùng để admin tạo danh mục sản phẩm mới", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.Category.CREATE_CATEGORY)
    public ResponseEntity<RestData<CategoryResponseDto>> createCategory(
            @Valid @RequestBody CreateCategoryRequestDto request) {
        CategoryResponseDto response = categoryService.createCategory(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật danh mục", description = "Dùng để admin cập nhật thông tin danh mục sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Category.UPDATE_CATEGORY)
    public ResponseEntity<RestData<CategoryResponseDto>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoryRequestDto request) {
        CategoryResponseDto response = categoryService.updateCategory(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa danh mục", description = "Dùng để admin xóa danh mục sản phẩm (chỉ xóa được khi không còn sản phẩm nào)", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.Category.DELETE_CATEGORY)
    public ResponseEntity<RestData<CommonResponseDto>> deleteCategory(@PathVariable UUID id) {
        CommonResponseDto response = categoryService.deleteCategory(id);
        return VsResponseUtil.success(response);
    }
}
