package com.example.pinkylab.product;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.product.dto.request.attribute.CreateAttributeRequestDto;
import com.example.pinkylab.product.dto.request.attribute.UpdateAttributeRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.attribute.AttributeResponseDto;
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
public class ProductAttributeController {

    ProductAttributeService attributeService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách thuộc tính của sản phẩm", description = "Tìm các thuộc tính (ví dụ Kích thước, Màu sắc, Chất liệu) của sản phẩm dựa theo ID sản phẩm")
    @GetMapping(UrlConstant.ProductAttribute.GET_ALL_ATTRIBUTES_BY_PRODUCT)
    public ResponseEntity<RestData<List<AttributeResponseDto>>> getAttributesByProductId(
            @PathVariable UUID productId) {
        List<AttributeResponseDto> response = attributeService.getAttributesByProductId(productId);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết thuộc tính", description = "Lấy thuộc tính dựa theo ID thuộc tính")
    @GetMapping(UrlConstant.ProductAttribute.GET_ATTRIBUTE_BY_ID)
    public ResponseEntity<RestData<AttributeResponseDto>> getAttributeById(@PathVariable UUID id) {
        AttributeResponseDto response = attributeService.getAttributeById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo thuộc tính mới", description = "Admin thêm thuộc tính (Key-Value) cho sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.ProductAttribute.CREATE_ATTRIBUTE)
    public ResponseEntity<RestData<AttributeResponseDto>> createAttribute(
            @PathVariable UUID productId,
            @Valid @RequestBody CreateAttributeRequestDto request) {
        AttributeResponseDto response = attributeService.createAttribute(productId, request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật thuộc tính", description = "Admin cập nhật thuộc tính", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.ProductAttribute.UPDATE_ATTRIBUTE)
    public ResponseEntity<RestData<AttributeResponseDto>> updateAttribute(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAttributeRequestDto request) {
        AttributeResponseDto response = attributeService.updateAttribute(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa thuộc tính", description = "Admin xóa thuộc tính của sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.ProductAttribute.DELETE_ATTRIBUTE)
    public ResponseEntity<RestData<CommonResponseDto>> deleteAttribute(@PathVariable UUID id) {
        CommonResponseDto response = attributeService.deleteAttribute(id);
        return VsResponseUtil.success(response);
    }
}
