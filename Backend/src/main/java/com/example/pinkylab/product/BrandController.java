package com.example.pinkylab.product;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.brand.CreateBrandRequestDto;
import com.example.pinkylab.product.dto.request.brand.UpdateBrandRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.brand.BrandResponseDto;
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
public class BrandController {

    BrandService brandService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách tất cả thương hiệu", description = "Dùng để lấy danh sách tất cả thương hiệu sản phẩm có phân trang")
    @GetMapping(UrlConstant.Brand.GET_ALL_BRANDS)
    public ResponseEntity<RestData<PaginationResponseDto<BrandResponseDto>>> getAllBrands(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<BrandResponseDto> response = brandService.getAllBrands(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết thương hiệu theo ID", description = "Dùng để lấy thông tin chi tiết của một thương hiệu")
    @GetMapping(UrlConstant.Brand.GET_BRAND_BY_ID)
    public ResponseEntity<RestData<BrandResponseDto>> getBrandById(@PathVariable UUID id) {
        BrandResponseDto response = brandService.getBrandById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo thương hiệu mới", description = "Dùng để admin tạo thương hiệu sản phẩm mới", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.Brand.CREATE_BRAND)
    public ResponseEntity<RestData<BrandResponseDto>> createBrand(
            @Valid @RequestBody CreateBrandRequestDto request) {
        BrandResponseDto response = brandService.createBrand(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Tải lên logo thương hiệu", description = "Dùng để admin tải lên logo cho thương hiệu", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.Brand.UPDATE_BRAND + "/logo")
    public ResponseEntity<RestData<BrandResponseDto>> uploadBrandLogo(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        BrandResponseDto response = brandService.uploadLogo(id, file);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Cập nhật thương hiệu", description = "Dùng để admin cập nhật thông tin thương hiệu sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Brand.UPDATE_BRAND)
    public ResponseEntity<RestData<BrandResponseDto>> updateBrand(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBrandRequestDto request) {
        BrandResponseDto response = brandService.updateBrand(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa thương hiệu", description = "Dùng để admin xóa thương hiệu sản phẩm (chỉ xóa được khi không còn sản phẩm nào)", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.Brand.DELETE_BRAND)
    public ResponseEntity<RestData<CommonResponseDto>> deleteBrand(@PathVariable UUID id) {
        CommonResponseDto response = brandService.deleteBrand(id);
        return VsResponseUtil.success(response);
    }
}
