package com.example.pinkylab.product;

import com.example.pinkylab.product.dto.request.category.CreateCategoryRequestDto;
import com.example.pinkylab.product.dto.request.category.UpdateCategoryRequestDto;
import com.example.pinkylab.product.dto.response.category.CategoryResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface CategoryMapper {

    @Mapping(target = "totalProducts", expression = "java(category.getProducts() != null ? category.getProducts().size() : 0)")
    CategoryResponseDto categoryToCategoryResponseDto(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "products", ignore = true)
    Category createCategoryRequestDtoToCategory(CreateCategoryRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "products", ignore = true)
    void updateCategoryFromDto(UpdateCategoryRequestDto request, @MappingTarget Category category);
}
