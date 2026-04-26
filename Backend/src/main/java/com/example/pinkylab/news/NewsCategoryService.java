package com.example.pinkylab.news;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.news.dto.request.category.NewsCategoryRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.category.NewsCategoryCountDto;
import com.example.pinkylab.news.dto.response.category.NewsCategoryResponseDto;

import java.util.List;
import java.util.UUID;

public interface NewsCategoryService {

    PaginationResponseDto<NewsCategoryResponseDto> getAllCategories(PaginationRequestDto request);

    NewsCategoryResponseDto getCategoryById(UUID id);

    List<NewsCategoryCountDto> getCategoryCounts();

    NewsCategoryResponseDto createCategory(NewsCategoryRequestDto request);

    NewsCategoryResponseDto updateCategory(UUID id, NewsCategoryRequestDto request);

    CommonResponseDto deleteCategory(UUID id);
}
