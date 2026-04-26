package com.example.pinkylab.product;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.brand.CreateBrandRequestDto;
import com.example.pinkylab.product.dto.request.brand.UpdateBrandRequestDto;
import com.example.pinkylab.product.dto.response.brand.BrandResponseDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface BrandService {

    // Public
    PaginationResponseDto<BrandResponseDto> getAllBrands(PaginationRequestDto request);

    BrandResponseDto getBrandById(UUID id);

    // Admin
    BrandResponseDto createBrand(CreateBrandRequestDto request);

    BrandResponseDto updateBrand(UUID id, UpdateBrandRequestDto request);

    BrandResponseDto uploadLogo(UUID id, MultipartFile file);

    CommonResponseDto deleteBrand(UUID id);
}
