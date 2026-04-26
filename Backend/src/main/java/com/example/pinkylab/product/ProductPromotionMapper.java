package com.example.pinkylab.product;

import com.example.pinkylab.product.dto.request.promotion.CreatePromotionRequestDto;
import com.example.pinkylab.product.dto.request.promotion.UpdatePromotionRequestDto;
import com.example.pinkylab.product.dto.response.promotion.PromotionResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface ProductPromotionMapper {

    @Mapping(target = "productId", source = "product.id")
    PromotionResponseDto toResponseDto(ProductPromotion promotion);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ProductPromotion toEntity(CreatePromotionRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(UpdatePromotionRequestDto request, @MappingTarget ProductPromotion promotion);
}
