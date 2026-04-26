package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.web.dto.request.member.CreateMemberRequestDto;
import com.example.pinkylab.shared.web.dto.request.member.UpdateMemberRequestDto;
import com.example.pinkylab.shared.web.dto.response.member.MemberResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface ProfessionalMemberMapper {

    MemberResponseDto toResponseDto(ProfessionalMember member);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    ProfessionalMember toEntity(CreateMemberRequestDto request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    void updateEntityFromDto(UpdateMemberRequestDto request, @MappingTarget ProfessionalMember member);
}
