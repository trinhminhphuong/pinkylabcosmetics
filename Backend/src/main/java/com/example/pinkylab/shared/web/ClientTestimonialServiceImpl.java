package com.example.pinkylab.shared.web;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.shared.web.dto.request.testimonial.CreateTestimonialRequestDto;
import com.example.pinkylab.shared.web.dto.request.testimonial.UpdateTestimonialRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.shared.web.dto.response.testimonial.TestimonialResponseDto;
import com.example.pinkylab.shared.exception.VsException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ClientTestimonialServiceImpl implements ClientTestimonialService {

    ClientTestimonialRepository testimonialRepository;
    ClientTestimonialMapper testimonialMapper;
    Cloudinary cloudinary;

    @Override
    public PaginationResponseDto<TestimonialResponseDto> getAllTestimonials(PaginationRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());

        Page<ClientTestimonial> testimonialPage = testimonialRepository.findAll(pageable);

        List<TestimonialResponseDto> dtos = testimonialPage.getContent()
                .stream()
                .map(testimonialMapper::toResponseDto)
                .collect(Collectors.toList());

        PagingMeta pagingMeta = new PagingMeta(
                testimonialPage.getTotalElements(),
                testimonialPage.getTotalPages(),
                request.getPageNum() + 1,
                request.getPageSize(),
                null,
                null);

        return new PaginationResponseDto<>(pagingMeta, dtos);
    }

    @Override
    public TestimonialResponseDto getTestimonialById(UUID id) {
        ClientTestimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ClientTestimonial.ERR_TESTIMONIAL_NOT_FOUND));

        return testimonialMapper.toResponseDto(testimonial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TestimonialResponseDto createTestimonial(CreateTestimonialRequestDto request) {
        ClientTestimonial testimonial = testimonialMapper.toEntity(request);
        testimonial.setAvatarUrl("");
        testimonial.setCreatedAt(LocalDateTime.now());

        return testimonialMapper.toResponseDto(testimonialRepository.save(testimonial));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TestimonialResponseDto updateTestimonial(UUID id, UpdateTestimonialRequestDto request) {
        ClientTestimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ClientTestimonial.ERR_TESTIMONIAL_NOT_FOUND));

        testimonialMapper.updateEntityFromDto(request, testimonial);

        return testimonialMapper.toResponseDto(testimonialRepository.save(testimonial));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TestimonialResponseDto uploadAvatar(UUID id, MultipartFile file) {
        ClientTestimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ClientTestimonial.ERR_TESTIMONIAL_NOT_FOUND));

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = (String) result.get("secure_url");
            testimonial.setAvatarUrl(imageUrl);
        } catch (Exception e) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.ERR_UPLOAD_IMAGE_FAIL);
        }

        return testimonialMapper.toResponseDto(testimonialRepository.save(testimonial));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CommonResponseDto deleteTestimonial(UUID id) {
        ClientTestimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ClientTestimonial.ERR_TESTIMONIAL_NOT_FOUND));

        testimonialRepository.delete(testimonial);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.ClientTestimonial.DELETE_TESTIMONIAL_SUCCESS);
    }
}
