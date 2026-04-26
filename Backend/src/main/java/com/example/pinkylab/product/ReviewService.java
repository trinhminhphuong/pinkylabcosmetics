package com.example.pinkylab.product;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.review.CreateReviewRequestDto;
import com.example.pinkylab.product.dto.request.review.UpdateReviewRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.review.ReviewResponseDto;

import java.util.UUID;

public interface ReviewService {

    PaginationResponseDto<ReviewResponseDto> getReviewsByProductId(UUID productId, PaginationRequestDto request);

    ReviewResponseDto getReviewById(UUID id);

    ReviewResponseDto createReview(UUID productId, CreateReviewRequestDto request);

    ReviewResponseDto updateReview(UUID id, UpdateReviewRequestDto request);

    CommonResponseDto deleteReview(UUID id);
}
