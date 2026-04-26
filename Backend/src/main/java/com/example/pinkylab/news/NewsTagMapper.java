package com.example.pinkylab.news;

import com.example.pinkylab.news.dto.request.tag.NewsTagRequestDto;
import com.example.pinkylab.news.dto.response.tag.NewsTagResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface NewsTagMapper {

    NewsTagResponseDto toResponseDto(NewsTag tag);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "newsList", ignore = true)
    NewsTag toEntity(NewsTagRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "newsList", ignore = true)
    void updateEntityFromDto(NewsTagRequestDto request, @MappingTarget NewsTag tag);
}
