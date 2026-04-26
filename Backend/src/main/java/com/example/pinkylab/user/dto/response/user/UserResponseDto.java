package com.example.pinkylab.user.dto.response.user;

import com.example.pinkylab.user.Address;
import com.example.pinkylab.user.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponseDto {
  UUID id;

  String email;

  String firstName;

  String lastName;

  String linkAvatar;

  LocalDate createdAt;

  Address address;

  String phone;

  Boolean enabled;

  Role role;
}
