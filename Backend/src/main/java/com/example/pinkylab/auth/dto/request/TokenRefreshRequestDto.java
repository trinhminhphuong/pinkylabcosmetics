package com.example.pinkylab.auth.dto.request;

import com.example.pinkylab.shared.constant.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenRefreshRequestDto {

    @NotBlank(message = ErrorMessage.NOT_BLANK_FIELD)
    String refreshToken;

}
