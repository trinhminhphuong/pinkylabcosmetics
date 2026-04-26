package com.example.pinkylab.news;

import com.example.pinkylab.news.dto.request.category.NewsCategoryRequestDto;
import com.example.pinkylab.news.dto.response.category.NewsCategoryResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface NewsCategoryMapper {

    NewsCategoryResponseDto toResponseDto(NewsCategory category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "newsList", ignore = true)
    NewsCategory toEntity(NewsCategoryRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "newsList", ignore = true)
    void updateEntityFromDto(NewsCategoryRequestDto request, @MappingTarget NewsCategory category);
}
