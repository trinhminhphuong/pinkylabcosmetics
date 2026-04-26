package com.example.pinkylab.user;

import com.example.pinkylab.user.dto.request.admin.UpdateUserRequestDto;
import com.example.pinkylab.user.dto.request.user.personalInformation.UpdatePersonalInformationRequestDto;
import org.mapstruct.*;

import com.example.pinkylab.user.dto.request.admin.CreateUserRequestDto;
import com.example.pinkylab.user.dto.response.user.UserResponseDto;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface UserMapper {

  UserResponseDto userToUserResponseDto(User user);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "password", ignore = true)
  @Mapping(target = "linkAvatar", ignore = true)
  @Mapping(target = "avatarPublicId", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "address", ignore = true)
  @Mapping(target = "enabled", ignore = true)
  User createUserRequestDtoToUser(CreateUserRequestDto request);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "password", ignore = true)
  @Mapping(target = "linkAvatar", ignore = true)
  @Mapping(target = "avatarPublicId", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "address", ignore = true)
  @Mapping(target = "enabled", ignore = true)
  void updateUserFromDto(UpdateUserRequestDto request, @MappingTarget User user);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "password", ignore = true)
  @Mapping(target = "email", ignore = true)
  @Mapping(target = "linkAvatar", ignore = true)
  @Mapping(target = "avatarPublicId", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "role", ignore = true)
  @Mapping(target = "address", ignore = true)
  @Mapping(target = "enabled", ignore = true)
  void updateUserFromPersonalInformationDto(UpdatePersonalInformationRequestDto request, @MappingTarget User user);
}
