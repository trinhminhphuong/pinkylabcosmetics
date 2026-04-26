package com.example.pinkylab.news;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.news.CreateNewsRequestDto;
import com.example.pinkylab.news.dto.request.news.UpdateNewsRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.news.NewsResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
public class NewsController {

    NewsService newsService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách tin tức", description = "Tìm danh sách tin tức với bộ lọc theo category hoặc tag")
    @GetMapping(UrlConstant.News.GET_ALL_NEWS)
    public ResponseEntity<RestData<PaginationResponseDto<NewsResponseDto>>> getAllNews(
            @Parameter(description = "ID danh mục tin tức (không bắt buộc)") @RequestParam(required = false) UUID categoryId,
            @Parameter(description = "ID tag tin tức (không bắt buộc)") @RequestParam(required = false) UUID tagId,
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<NewsResponseDto> response = newsService.getAllNews(categoryId, tagId, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết tin tức", description = "Lấy chi tiết bài viết dựa trên ID")
    @GetMapping(UrlConstant.News.GET_NEWS_BY_ID)
    public ResponseEntity<RestData<NewsResponseDto>> getNewsById(@PathVariable UUID id) {
        NewsResponseDto response = newsService.getNewsById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo bài viết mới", description = "Tạo mới thông tin bài viết", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.News.CREATE_NEWS)
    public ResponseEntity<RestData<NewsResponseDto>> createNews(
            @Valid @RequestBody CreateNewsRequestDto request) {
        NewsResponseDto response = newsService.createNews(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật bài viết", description = "Chỉnh sửa tiêu đề, nội dung, danh mục cho bài viết", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.News.UPDATE_NEWS)
    public ResponseEntity<RestData<NewsResponseDto>> updateNews(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateNewsRequestDto request) {
        NewsResponseDto response = newsService.updateNews(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Upload thumbnail", description = "Tải ảnh bìa (thumbnail) bài viết", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(value = UrlConstant.News.UPLOAD_THUMBNAIL, consumes = "multipart/form-data")
    public ResponseEntity<RestData<NewsResponseDto>> uploadThumbnail(
            @PathVariable UUID id,
            @RequestPart("file") MultipartFile file) {
        NewsResponseDto response = newsService.uploadThumbnail(id, file);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Upload ảnh mô tả trong bài viết", description = "Tải các ảnh (tối đa 2) để sử dụng ở trong nội dung bài viết", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(value = UrlConstant.News.UPLOAD_IMAGES, consumes = "multipart/form-data")
    public ResponseEntity<RestData<NewsResponseDto>> uploadImages(
            @PathVariable UUID id,
            @RequestPart("files") List<MultipartFile> files) {
        NewsResponseDto response = newsService.uploadImages(id, files);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa bài viết", description = "Admin chức năng xóa bài viết", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.News.DELETE_NEWS)
    public ResponseEntity<RestData<CommonResponseDto>> deleteNews(@PathVariable UUID id) {
        CommonResponseDto response = newsService.deleteNews(id);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Thêm tags vào tin tức", description = "Gắn danh sách tag cho tin tức", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.News.ADD_TAGS_TO_NEWS)
    public ResponseEntity<RestData<NewsResponseDto>> addTagsToNews(
            @PathVariable UUID id,
            @RequestBody List<UUID> tagIds) {
        NewsResponseDto response = newsService.addTagsToNews(id, tagIds);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa tag khỏi tin", description = "Gỡ bỏ 1 tag khỏi danh sách tag của tin", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.News.REMOVE_TAG_FROM_NEWS)
    public ResponseEntity<RestData<NewsResponseDto>> removeTagFromNews(
            @PathVariable UUID id,
            @PathVariable UUID tagId) {
        NewsResponseDto response = newsService.removeTagFromNews(id, tagId);
        return VsResponseUtil.success(response);
    }
}
