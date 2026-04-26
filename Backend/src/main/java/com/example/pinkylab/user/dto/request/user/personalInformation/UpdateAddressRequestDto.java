package com.example.pinkylab.user.dto.request.user.personalInformation;

import com.example.pinkylab.shared.constant.ErrorMessage;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAddressRequestDto {

    String companyName;

    @NotBlank(message = ErrorMessage.NOT_BLANK_FIELD)
    String streetAddress;

    @NotBlank(message = ErrorMessage.NOT_BLANK_FIELD)
    String country;

    @NotBlank(message = ErrorMessage.NOT_BLANK_FIELD)
    String state;

    int zipCode;
}
