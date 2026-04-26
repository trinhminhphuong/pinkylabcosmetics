package com.example.pinkylab.product;

import com.example.pinkylab.product.dto.request.attribute.CreateAttributeRequestDto;
import com.example.pinkylab.product.dto.request.attribute.UpdateAttributeRequestDto;
import com.example.pinkylab.product.dto.response.attribute.AttributeResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface ProductAttributeMapper {

    @Mapping(target = "productId", source = "product.id")
    AttributeResponseDto toResponseDto(ProductAttribute attribute);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    ProductAttribute toEntity(CreateAttributeRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    void updateEntityFromDto(UpdateAttributeRequestDto request, @MappingTarget ProductAttribute attribute);
}
