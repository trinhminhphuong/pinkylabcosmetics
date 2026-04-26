package com.example.pinkylab.auth.dto.response;

import com.example.pinkylab.shared.constant.CommonConstant;
import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenRefreshResponseDto {

    @Builder.Default
    String tokenType = CommonConstant.BEARER_TOKEN;

    String accessToken;

    String refreshToken;

}
