package com.example.pinkylab.product;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.category.CreateCategoryRequestDto;
import com.example.pinkylab.product.dto.request.category.UpdateCategoryRequestDto;
import com.example.pinkylab.product.dto.response.category.CategoryResponseDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;

import java.util.UUID;

public interface CategoryService {

    // Public
    PaginationResponseDto<CategoryResponseDto> getAllCategories(PaginationRequestDto request);

    CategoryResponseDto getCategoryById(UUID id);

    // Admin
    CategoryResponseDto createCategory(CreateCategoryRequestDto request);

    CategoryResponseDto updateCategory(UUID id, UpdateCategoryRequestDto request);

    CommonResponseDto deleteCategory(UUID id);
}
