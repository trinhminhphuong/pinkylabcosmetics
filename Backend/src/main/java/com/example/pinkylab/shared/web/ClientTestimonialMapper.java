package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.web.dto.request.testimonial.CreateTestimonialRequestDto;
import com.example.pinkylab.shared.web.dto.request.testimonial.UpdateTestimonialRequestDto;
import com.example.pinkylab.shared.web.dto.response.testimonial.TestimonialResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface ClientTestimonialMapper {

    TestimonialResponseDto toResponseDto(ClientTestimonial testimonial);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ClientTestimonial toEntity(CreateTestimonialRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(UpdateTestimonialRequestDto request, @MappingTarget ClientTestimonial testimonial);
}
