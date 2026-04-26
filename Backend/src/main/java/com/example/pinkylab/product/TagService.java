package com.example.pinkylab.product;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.tag.CreateTagRequestDto;
import com.example.pinkylab.product.dto.request.tag.UpdateTagRequestDto;
import com.example.pinkylab.product.dto.response.tag.TagResponseDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;

import java.util.UUID;

public interface TagService {

    // Public
    PaginationResponseDto<TagResponseDto> getAllTags(PaginationRequestDto request);

    TagResponseDto getTagById(UUID id);

    // Admin
    TagResponseDto createTag(CreateTagRequestDto request);

    TagResponseDto updateTag(UUID id, UpdateTagRequestDto request);

    CommonResponseDto deleteTag(UUID id);
}
