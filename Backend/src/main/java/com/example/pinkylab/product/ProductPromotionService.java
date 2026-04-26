package com.example.pinkylab.product;

import com.example.pinkylab.product.dto.request.promotion.CreatePromotionRequestDto;
import com.example.pinkylab.product.dto.request.promotion.UpdatePromotionRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.promotion.PromotionResponseDto;

import java.util.List;
import java.util.UUID;

public interface ProductPromotionService {

    List<PromotionResponseDto> getPromotionsByProductId(UUID productId);

    PromotionResponseDto getPromotionById(UUID id);

    PromotionResponseDto createPromotion(UUID productId, CreatePromotionRequestDto request);

    PromotionResponseDto updatePromotion(UUID id, UpdatePromotionRequestDto request);

    CommonResponseDto deletePromotion(UUID id);
}
