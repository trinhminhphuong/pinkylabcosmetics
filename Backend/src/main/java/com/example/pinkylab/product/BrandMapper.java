package com.example.pinkylab.product;

import com.example.pinkylab.product.dto.request.brand.CreateBrandRequestDto;
import com.example.pinkylab.product.dto.request.brand.UpdateBrandRequestDto;
import com.example.pinkylab.product.dto.response.brand.BrandResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface BrandMapper {

    @Mapping(target = "totalProducts", expression = "java(brand.getProducts() != null ? brand.getProducts().size() : 0)")
    BrandResponseDto brandToBrandResponseDto(Brand brand);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    Brand createBrandRequestDtoToBrand(CreateBrandRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    void updateBrandFromDto(UpdateBrandRequestDto request, @MappingTarget Brand brand);
}
