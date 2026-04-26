package com.example.pinkylab.news;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.comment.NewsCommentRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.comment.NewsCommentResponseDto;

import java.util.UUID;

public interface NewsCommentService {

    PaginationResponseDto<NewsCommentResponseDto> getCommentsByNewsId(UUID newsId, PaginationRequestDto request);

    NewsCommentResponseDto getCommentById(UUID id);

    NewsCommentResponseDto createComment(UUID newsId, NewsCommentRequestDto request);

    NewsCommentResponseDto updateComment(UUID id, NewsCommentRequestDto request);

    CommonResponseDto deleteComment(UUID id);
}
