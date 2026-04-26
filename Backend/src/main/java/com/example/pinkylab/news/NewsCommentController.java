package com.example.pinkylab.news;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.comment.NewsCommentRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.comment.NewsCommentResponseDto;
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
public class NewsCommentController {

    NewsCommentService newsCommentService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách bình luận của bài viết", description = "Tìm các bình luận dựa theo ID bài viết")
    @GetMapping(UrlConstant.NewsComment.GET_ALL_COMMENTS)
    public ResponseEntity<RestData<PaginationResponseDto<NewsCommentResponseDto>>> getCommentsByNewsId(
            @PathVariable UUID newsId,
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<NewsCommentResponseDto> response = newsCommentService.getCommentsByNewsId(newsId,
                request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết bình luận", description = "Tìm chi tiết 1 bình luận theo ID")
    @GetMapping(UrlConstant.NewsComment.GET_COMMENT_BY_ID)
    public ResponseEntity<RestData<NewsCommentResponseDto>> getCommentById(@PathVariable UUID id) {
        NewsCommentResponseDto response = newsCommentService.getCommentById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== USER / ADMIN ====================

    @Operation(summary = "Tạo bình luận", description = "Người dùng đưa ra bình luận về bài viết", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.NewsComment.CREATE_COMMENT)
    public ResponseEntity<RestData<NewsCommentResponseDto>> createComment(
            @PathVariable UUID newsId,
            @Valid @RequestBody NewsCommentRequestDto request) {
        NewsCommentResponseDto response = newsCommentService.createComment(newsId, request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Cập nhật bình luận", description = "Người dùng có thể sửa đổi nội dung bình luận của mình", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.NewsComment.UPDATE_COMMENT)
    public ResponseEntity<RestData<NewsCommentResponseDto>> updateComment(
            @PathVariable UUID id,
            @Valid @RequestBody NewsCommentRequestDto request) {
        NewsCommentResponseDto response = newsCommentService.updateComment(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa bình luận", description = "Admin hoặc User tự xóa bình luận của mình", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.NewsComment.DELETE_COMMENT)
    public ResponseEntity<RestData<CommonResponseDto>> deleteComment(@PathVariable UUID id) {
        CommonResponseDto response = newsCommentService.deleteComment(id);
        return VsResponseUtil.success(response);
    }
}
