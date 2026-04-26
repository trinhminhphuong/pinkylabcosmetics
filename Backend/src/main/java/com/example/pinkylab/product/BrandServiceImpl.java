package com.example.pinkylab.product;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.product.dto.request.brand.CreateBrandRequestDto;
import com.example.pinkylab.product.dto.request.brand.UpdateBrandRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.brand.BrandResponseDto;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BrandServiceImpl implements BrandService {

    BrandRepository brandRepository;

    BrandMapper brandMapper;

    Cloudinary cloudinary;

    @Override
    public PaginationResponseDto<BrandResponseDto> getAllBrands(PaginationRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());

        Page<Brand> brandPage = brandRepository.findAll(pageable);

        List<BrandResponseDto> brandResponseDtos = brandPage.getContent()
                .stream()
                .map(brandMapper::brandToBrandResponseDto)
                .collect(Collectors.toList());

        PagingMeta pagingMeta = new PagingMeta(
                brandPage.getTotalElements(),
                brandPage.getTotalPages(),
                request.getPageNum() + 1,
                request.getPageSize(),
                null,
                null);

        return new PaginationResponseDto<>(pagingMeta, brandResponseDtos);
    }

    @Override
    public BrandResponseDto getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Brand.ERR_BRAND_NOT_FOUND));

        return brandMapper.brandToBrandResponseDto(brand);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BrandResponseDto createBrand(CreateBrandRequestDto request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.Brand.ERR_BRAND_NAME_EXISTED);
        }

        Brand brand = brandMapper.createBrandRequestDtoToBrand(request);

        return brandMapper.brandToBrandResponseDto(brandRepository.save(brand));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BrandResponseDto updateBrand(UUID id, UpdateBrandRequestDto request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Brand.ERR_BRAND_NOT_FOUND));

        if (request.getName() != null && !request.getName().equals(brand.getName())) {
            if (brandRepository.existsByName(request.getName())) {
                throw new VsException(HttpStatus.CONFLICT, ErrorMessage.Brand.ERR_BRAND_NAME_EXISTED);
            }
        }

        brandMapper.updateBrandFromDto(request, brand);

        return brandMapper.brandToBrandResponseDto(brandRepository.save(brand));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BrandResponseDto uploadLogo(UUID id, MultipartFile file) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Brand.ERR_BRAND_NOT_FOUND));

        String imageUrl;
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            imageUrl = (String) result.get("secure_url");
        } catch (Exception e) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.ERR_UPLOAD_IMAGE_FAIL);
        }

        brand.setLogoUrl(imageUrl);
        return brandMapper.brandToBrandResponseDto(brandRepository.save(brand));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CommonResponseDto deleteBrand(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Brand.ERR_BRAND_NOT_FOUND));

        if (brand.getProducts() != null && !brand.getProducts().isEmpty()) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.Brand.ERR_BRAND_HAS_PRODUCTS);
        }

        brandRepository.delete(brand);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Brand.DELETE_BRAND_SUCCESS);
    }
}
