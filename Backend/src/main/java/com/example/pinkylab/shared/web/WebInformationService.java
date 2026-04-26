package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.web.dto.request.webinfo.WebInformationRequestDto;
import com.example.pinkylab.shared.web.dto.response.webinfo.WebInformationResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface WebInformationService {

    WebInformationResponseDto getWebInformation();

    WebInformationResponseDto updateWebInformation(WebInformationRequestDto request);

    WebInformationResponseDto uploadLogo(MultipartFile file);
}
