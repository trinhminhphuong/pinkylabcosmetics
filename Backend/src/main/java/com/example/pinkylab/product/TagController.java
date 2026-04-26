package com.example.pinkylab.product;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.tag.CreateTagRequestDto;
import com.example.pinkylab.product.dto.request.tag.UpdateTagRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.tag.TagResponseDto;
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
public class TagController {

    TagService tagService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách tất cả tag", description = "Dùng để lấy danh sách tất cả tag sản phẩm có phân trang")
    @GetMapping(UrlConstant.Tag.GET_ALL_TAGS)
    public ResponseEntity<RestData<PaginationResponseDto<TagResponseDto>>> getAllTags(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<TagResponseDto> response = tagService.getAllTags(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết tag theo ID", description = "Dùng để lấy thông tin chi tiết của một tag")
    @GetMapping(UrlConstant.Tag.GET_TAG_BY_ID)
    public ResponseEntity<RestData<TagResponseDto>> getTagById(@PathVariable UUID id) {
        TagResponseDto response = tagService.getTagById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo tag mới", description = "Dùng để admin tạo tag sản phẩm mới", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.Tag.CREATE_TAG)
    public ResponseEntity<RestData<TagResponseDto>> createTag(
            @Valid @RequestBody CreateTagRequestDto request) {
        TagResponseDto response = tagService.createTag(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật tag", description = "Dùng để admin cập nhật thông tin tag sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.Tag.UPDATE_TAG)
    public ResponseEntity<RestData<TagResponseDto>> updateTag(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTagRequestDto request) {
        TagResponseDto response = tagService.updateTag(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa tag", description = "Dùng để admin xóa tag sản phẩm", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.Tag.DELETE_TAG)
    public ResponseEntity<RestData<CommonResponseDto>> deleteTag(@PathVariable UUID id) {
        CommonResponseDto response = tagService.deleteTag(id);
        return VsResponseUtil.success(response);
    }
}
