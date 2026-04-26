package com.example.pinkylab.user;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.user.dto.request.admin.CreateUserRequestDto;
import com.example.pinkylab.user.dto.request.admin.UpdateUserRequestDto;
import com.example.pinkylab.user.dto.request.user.personalInformation.PersonalInformationRequestDto;
import com.example.pinkylab.user.dto.request.user.profile.UpdateProfileRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.user.dto.response.user.UserResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface UserService {

  UserResponseDto personalInformation(UUID userId, PersonalInformationRequestDto request);

  UserResponseDto uploadAvatar(UUID userId, MultipartFile file);

  UserResponseDto getMyProfile(UUID userId);

  UserResponseDto updateProfile(UpdateProfileRequestDto request, UUID userId);

  CommonResponseDto changePassword(UUID userId, com.example.pinkylab.user.dto.request.ChangePasswordRequestDto request);

  UserResponseDto updateBillingAddress(UUID userId,
      com.example.pinkylab.order.dto.request.order.AddressDto request);

  PaginationResponseDto<UserResponseDto> getAllUsers(PaginationRequestDto request);

  UserResponseDto getUserById(UUID userId);

  UserResponseDto createUser(CreateUserRequestDto request);

  UserResponseDto updateUser(UUID userId, UpdateUserRequestDto request);

  CommonResponseDto deleteUserAccount(UUID userId);

  PaginationResponseDto<UserResponseDto> searchUserByUsername(String searchSentence,
      PaginationRequestDto paginationRequestDto);

  PaginationResponseDto<UserResponseDto> searchUserByEmail(String searchSentence,
      PaginationRequestDto paginationRequestDto);

  PaginationResponseDto<UserResponseDto> searchUserByPhone(String searchSentence,
      PaginationRequestDto paginationRequestDto);

  UserResponseDto lockUser(UUID userId);

  UserResponseDto unlockUser(UUID userId);
}
