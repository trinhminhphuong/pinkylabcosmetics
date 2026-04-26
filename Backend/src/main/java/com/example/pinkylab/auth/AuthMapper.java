package com.example.pinkylab.auth;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.pinkylab.auth.dto.request.RegisterRequestDto;
import com.example.pinkylab.user.dto.response.user.UserResponseDto;
import com.example.pinkylab.user.User;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface AuthMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "password", ignore = true)
  @Mapping(target = "role", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "address", ignore = true)
  @Mapping(target = "phone", ignore = true)
  @Mapping(target = "linkAvatar", ignore = true)
  @Mapping(target = "avatarPublicId", ignore = true)
  User registerRequestDtoToUser(RegisterRequestDto request);

  UserResponseDto userToUserResponseDto(User user);
}
