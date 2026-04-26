package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.web.dto.request.webinfo.WebInformationRequestDto;
import com.example.pinkylab.shared.web.dto.response.webinfo.WebInformationResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WebInformationController {

    WebInformationService webInformationService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy thông tin website", description = "API cho phép lấy các thông tin chung của website (Logo, địa chỉ, lượt follow...)")
    @GetMapping(UrlConstant.WebInformation.GET_WEB_INFORMATION)
    public ResponseEntity<RestData<WebInformationResponseDto>> getWebInformation() {
        WebInformationResponseDto response = webInformationService.getWebInformation();
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Cập nhật logo website", description = "Cập nhật hình ảnh logo cho website", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.WebInformation.UPDATE_WEB_LOGO)
    public ResponseEntity<RestData<WebInformationResponseDto>> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        WebInformationResponseDto response = webInformationService.uploadLogo(file);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Cập nhật thông tin website", description = "Cập nhật chi tiết các trường như địa chỉ, lượt khách hàng, thành viên,...", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.WebInformation.UPDATE_WEB_INFORMATION)
    public ResponseEntity<RestData<WebInformationResponseDto>> updateWebInformation(
            @Valid @RequestBody WebInformationRequestDto request) {
        WebInformationResponseDto response = webInformationService.updateWebInformation(request);
        return VsResponseUtil.success(response);
    }
}
