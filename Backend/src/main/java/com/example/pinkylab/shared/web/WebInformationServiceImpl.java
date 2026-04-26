package com.example.pinkylab.shared.web;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.web.dto.request.webinfo.WebInformationRequestDto;
import com.example.pinkylab.shared.web.dto.response.webinfo.WebInformationResponseDto;
import com.example.pinkylab.shared.exception.VsException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WebInformationServiceImpl implements WebInformationService {

    WebInformationRepository webInformationRepository;
    WebInformationMapper webInformationMapper;
    Cloudinary cloudinary;

    @Override
    public WebInformationResponseDto getWebInformation() {
        WebInformation webInfo = getOrCreateDefaultWebInfo();
        return webInformationMapper.toResponseDto(webInfo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WebInformationResponseDto updateWebInformation(WebInformationRequestDto request) {
        WebInformation webInfo = getOrCreateDefaultWebInfo();

        webInformationMapper.updateEntityFromDto(request, webInfo);

        return webInformationMapper.toResponseDto(webInformationRepository.save(webInfo));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WebInformationResponseDto uploadLogo(MultipartFile file) {
        WebInformation webInfo = getOrCreateDefaultWebInfo();

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = (String) result.get("secure_url");
            webInfo.setLogoUrl(imageUrl);
        } catch (Exception e) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.ERR_UPLOAD_IMAGE_FAIL);
        }

        return webInformationMapper.toResponseDto(webInformationRepository.save(webInfo));
    }

    private WebInformation getOrCreateDefaultWebInfo() {
        List<WebInformation> infos = webInformationRepository.findAll();
        if (infos.isEmpty()) {
            WebInformation newInfo = WebInformation.builder()
                    .logoUrl("")
                    .yearOfHardWork(0)
                    .happyCustomers(0)
                    .qualifiedTeamMembers(0)
                    .monthlyOrders(0)
                    .companyName("Công Ty TNHH")
                    .slogan("Chăm sóc sức khỏe")
                    .phone("0123456789")
                    .email("contact@nguyencham.com")
                    .address("Vietnam")
                    .copyrightText("Copyright © 2026")
                    .build();
            return webInformationRepository.save(newInfo);
        }
        // Always return the first/only record
        return infos.get(0);
    }
}
