package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.web.dto.request.testimonial.CreateTestimonialRequestDto;
import com.example.pinkylab.shared.web.dto.request.testimonial.UpdateTestimonialRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.shared.web.dto.response.testimonial.TestimonialResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ClientTestimonialService {

    PaginationResponseDto<TestimonialResponseDto> getAllTestimonials(PaginationRequestDto request);

    TestimonialResponseDto getTestimonialById(UUID id);

    TestimonialResponseDto createTestimonial(CreateTestimonialRequestDto request);

    TestimonialResponseDto updateTestimonial(UUID id, UpdateTestimonialRequestDto request);

    TestimonialResponseDto uploadAvatar(UUID id, MultipartFile file);

    CommonResponseDto deleteTestimonial(UUID id);
}
