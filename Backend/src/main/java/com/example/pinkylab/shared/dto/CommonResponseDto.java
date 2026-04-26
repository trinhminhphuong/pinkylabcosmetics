package com.example.pinkylab.shared.dto;

import lombok.*;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class CommonResponseDto {

    private HttpStatus status;

    private String message;

}
