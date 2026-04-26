package com.example.pinkylab.news;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.news.CreateNewsRequestDto;
import com.example.pinkylab.news.dto.request.news.UpdateNewsRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.news.NewsResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface NewsService {

    PaginationResponseDto<NewsResponseDto> getAllNews(UUID categoryId, UUID tagId, PaginationRequestDto request);

    NewsResponseDto getNewsById(UUID id);

    NewsResponseDto createNews(CreateNewsRequestDto request);

    NewsResponseDto updateNews(UUID id, UpdateNewsRequestDto request);

    NewsResponseDto uploadThumbnail(UUID id, MultipartFile file);

    NewsResponseDto uploadImages(UUID id, List<MultipartFile> files);

    CommonResponseDto deleteNews(UUID id);

    NewsResponseDto addTagsToNews(UUID id, List<UUID> tagIds);

    NewsResponseDto removeTagFromNews(UUID id, UUID tagId);
}
