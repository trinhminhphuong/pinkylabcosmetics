package com.example.pinkylab.product;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.product.dto.request.category.CreateCategoryRequestDto;
import com.example.pinkylab.product.dto.request.category.UpdateCategoryRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.category.CategoryResponseDto;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {

    CategoryRepository categoryRepository;

    CategoryMapper categoryMapper;

    @Override
    public PaginationResponseDto<CategoryResponseDto> getAllCategories(PaginationRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());

        Page<Category> categoryPage = categoryRepository.findAll(pageable);

        List<CategoryResponseDto> categoryResponseDtos = categoryPage.getContent()
                .stream()
                .map(categoryMapper::categoryToCategoryResponseDto)
                .collect(Collectors.toList());

        PagingMeta pagingMeta = new PagingMeta(
                categoryPage.getTotalElements(),
                categoryPage.getTotalPages(),
                request.getPageNum() + 1,
                request.getPageSize(),
                null,
                null);

        return new PaginationResponseDto<>(pagingMeta, categoryResponseDtos);
    }

    @Override
    public CategoryResponseDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Category.ERR_CATEGORY_NOT_FOUND));

        return categoryMapper.categoryToCategoryResponseDto(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryResponseDto createCategory(CreateCategoryRequestDto request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.Category.ERR_CATEGORY_NAME_EXISTED);
        }

        Category category = categoryMapper.createCategoryRequestDtoToCategory(request);

        return categoryMapper.categoryToCategoryResponseDto(categoryRepository.save(category));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryResponseDto updateCategory(UUID id, UpdateCategoryRequestDto request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Category.ERR_CATEGORY_NOT_FOUND));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new VsException(HttpStatus.CONFLICT, ErrorMessage.Category.ERR_CATEGORY_NAME_EXISTED);
            }
        }

        categoryMapper.updateCategoryFromDto(request, category);

        return categoryMapper.categoryToCategoryResponseDto(categoryRepository.save(category));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CommonResponseDto deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Category.ERR_CATEGORY_NOT_FOUND));

        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.Category.ERR_CATEGORY_HAS_PRODUCTS);
        }

        categoryRepository.delete(category);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Category.DELETE_CATEGORY_SUCCESS);
    }
}
