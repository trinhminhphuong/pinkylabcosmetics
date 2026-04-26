package com.example.pinkylab.news;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.tag.NewsTagRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.tag.NewsTagResponseDto;

import java.util.UUID;

public interface NewsTagService {

    PaginationResponseDto<NewsTagResponseDto> getAllTags(PaginationRequestDto request);

    NewsTagResponseDto getTagById(UUID id);

    NewsTagResponseDto createTag(NewsTagRequestDto request);

    NewsTagResponseDto updateTag(UUID id, NewsTagRequestDto request);

    CommonResponseDto deleteTag(UUID id);
}
