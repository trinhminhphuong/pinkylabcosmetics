package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.web.dto.request.webinfo.WebInformationRequestDto;
import com.example.pinkylab.shared.web.dto.response.webinfo.WebInformationResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface WebInformationMapper {

    WebInformationResponseDto toResponseDto(WebInformation webInfo);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    void updateEntityFromDto(WebInformationRequestDto request, @MappingTarget WebInformation webInfo);
}
