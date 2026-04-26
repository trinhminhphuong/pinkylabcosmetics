package com.example.pinkylab.product;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.product.CreateProductRequestDto;
import com.example.pinkylab.product.dto.request.product.UpdateProductRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.product.ProductResponseDto;
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

import java.util.List;
import java.util.UUID;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {

  ProductService productService;

  // ==================== PUBLIC ====================

  @Operation(summary = "Lấy danh sách sản phẩm", description = "Xem danh sách sản phẩm có phân trang")
  @GetMapping(UrlConstant.Product.GET_ALL_PRODUCTS)
  public ResponseEntity<RestData<PaginationResponseDto<ProductResponseDto>>> getAllProducts(
      @ModelAttribute PaginationRequestDto request) {
    PaginationResponseDto<ProductResponseDto> response = productService.getAllProducts(request);
    return VsResponseUtil.success(response);
  }

  @Operation(summary = "Lấy chi tiết sản phẩm", description = "Tìm thông tin chi tiết của 1 sản phẩm")
  @GetMapping(UrlConstant.Product.GET_PRODUCT_BY_ID)
  public ResponseEntity<RestData<ProductResponseDto>> getProductById(@PathVariable UUID id) {
    ProductResponseDto response = productService.getProductById(id);
    return VsResponseUtil.success(response);
  }

  // ==================== ADMIN ====================

  @Operation(summary = "Tạo sản phẩm mới", description = "Admin tạo mới sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
  @PostMapping(UrlConstant.Product.CREATE_PRODUCT)
  public ResponseEntity<RestData<ProductResponseDto>> createProduct(
      @Valid @RequestBody CreateProductRequestDto request) {
    ProductResponseDto response = productService.createProduct(request);
    return VsResponseUtil.success(HttpStatus.CREATED, response);
  }

  @Operation(summary = "Tải lên ảnh sản phẩm", description = "Admin tải lên nhiều ảnh cho sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
  @PostMapping(UrlConstant.Product.UPLOAD_IMAGES)
  public ResponseEntity<RestData<ProductResponseDto>> uploadImages(
      @PathVariable UUID id,
      @RequestParam("file") List<MultipartFile> files) {
    ProductResponseDto response = productService.uploadImages(id, files);
    return VsResponseUtil.success(response);
  }

  @Operation(summary = "Cập nhật sản phẩm", description = "Admin cập nhật thông tin sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
  @PutMapping(UrlConstant.Product.UPDATE_PRODUCT)
  public ResponseEntity<RestData<ProductResponseDto>> updateProduct(
      @PathVariable UUID id,
      @Valid @RequestBody UpdateProductRequestDto request) {
    ProductResponseDto response = productService.updateProduct(id, request);
    return VsResponseUtil.success(response);
  }

  @Operation(summary = "Xóa sản phẩm", description = "Admin xóa sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
  @DeleteMapping(UrlConstant.Product.DELETE_PRODUCT)
  public ResponseEntity<RestData<CommonResponseDto>> deleteProduct(@PathVariable UUID id) {
    CommonResponseDto response = productService.deleteProduct(id);
    return VsResponseUtil.success(response);
  }

  @Operation(summary = "Thêm tags vào sản phẩm", description = "Admin gán tags cho sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
  @PostMapping(UrlConstant.Product.ADD_TAGS_TO_PRODUCT)
  public ResponseEntity<RestData<ProductResponseDto>> addTagsToProduct(
      @PathVariable UUID id,
      @RequestBody List<UUID> tagIds) {
    ProductResponseDto response = productService.addTagsToProduct(id, tagIds);
    return VsResponseUtil.success(response);
  }

  @Operation(summary = "Xóa tag khỏi sản phẩm", description = "Admin gỡ tag khỏi sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
  @DeleteMapping(UrlConstant.Product.REMOVE_TAG_FROM_PRODUCT)
  public ResponseEntity<RestData<ProductResponseDto>> removeTagFromProduct(
      @PathVariable UUID id,
      @PathVariable UUID tagId) {
    ProductResponseDto response = productService.removeTagFromProduct(id, tagId);
    return VsResponseUtil.success(response);
  }
}
