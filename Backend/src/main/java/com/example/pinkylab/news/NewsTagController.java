package com.example.pinkylab.news;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.tag.NewsTagRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.tag.NewsTagResponseDto;
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
public class NewsTagController {

    NewsTagService newsTagService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách các tag tin tức", description = "Lấy danh sách có phân trang")
    @GetMapping(UrlConstant.NewsTag.GET_ALL_TAGS)
    public ResponseEntity<RestData<PaginationResponseDto<NewsTagResponseDto>>> getAllTags(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<NewsTagResponseDto> response = newsTagService.getAllTags(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết tag", description = "Tìm tag tin tức theo ID")
    @GetMapping(UrlConstant.NewsTag.GET_TAG_BY_ID)
    public ResponseEntity<RestData<NewsTagResponseDto>> getTagById(@PathVariable UUID id) {
        NewsTagResponseDto response = newsTagService.getTagById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo tag mới", description = "Admin tạo tag cho bài viết", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.NewsTag.CREATE_TAG)
    public ResponseEntity<RestData<NewsTagResponseDto>> createTag(
            @Valid @RequestBody NewsTagRequestDto request) {
        NewsTagResponseDto response = newsTagService.createTag(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật tag", description = "Sửa thông tin tag", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.NewsTag.UPDATE_TAG)
    public ResponseEntity<RestData<NewsTagResponseDto>> updateTag(
            @PathVariable UUID id,
            @Valid @RequestBody NewsTagRequestDto request) {
        NewsTagResponseDto response = newsTagService.updateTag(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa tag", description = "Xóa thông tin tag", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.NewsTag.DELETE_TAG)
    public ResponseEntity<RestData<CommonResponseDto>> deleteTag(@PathVariable UUID id) {
        CommonResponseDto response = newsTagService.deleteTag(id);
        return VsResponseUtil.success(response);
    }
}
