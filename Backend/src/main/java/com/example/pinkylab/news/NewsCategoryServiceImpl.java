package com.example.pinkylab.news;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.news.dto.request.category.NewsCategoryRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.news.dto.response.category.NewsCategoryCountDto;
import com.example.pinkylab.news.dto.response.category.NewsCategoryResponseDto;
import com.example.pinkylab.shared.exception.VsException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NewsCategoryServiceImpl implements NewsCategoryService {

    NewsCategoryRepository newsCategoryRepository;
    NewsCategoryMapper newsCategoryMapper;

    @Override
    public PaginationResponseDto<NewsCategoryResponseDto> getAllCategories(PaginationRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());
        Page<NewsCategory> page = newsCategoryRepository.findAll(pageable);

        List<NewsCategoryResponseDto> dtos = page.getContent()
                .stream()
                .map(newsCategoryMapper::toResponseDto)
                .collect(Collectors.toList());

        PagingMeta pagingMeta = new PagingMeta(
                page.getTotalElements(),
                page.getTotalPages(),
                request.getPageNum() + 1,
                request.getPageSize(),
                null,
                null);

        return new PaginationResponseDto<>(pagingMeta, dtos);
    }

    @Override
    public NewsCategoryResponseDto getCategoryById(UUID id) {
        NewsCategory category = newsCategoryRepository.findById(id)
                .orElseThrow(
                        () -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.NewsCategory.ERR_CATEGORY_NOT_FOUND));

        return newsCategoryMapper.toResponseDto(category);
    }

    @Override
    public List<NewsCategoryCountDto> getCategoryCounts() {
        return newsCategoryRepository.findNewsCategoryCounts();
    }

    @Override
    public NewsCategoryResponseDto createCategory(NewsCategoryRequestDto request) {
        if (newsCategoryRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.NewsCategory.ERR_NAME_EXISTED);
        }
        NewsCategory category = newsCategoryMapper.toEntity(request);
        return newsCategoryMapper.toResponseDto(newsCategoryRepository.save(category));
    }

    @Override
    public NewsCategoryResponseDto updateCategory(UUID id, NewsCategoryRequestDto request) {
        NewsCategory category = newsCategoryRepository.findById(id)
                .orElseThrow(
                        () -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.NewsCategory.ERR_CATEGORY_NOT_FOUND));

        if (!category.getName().equals(request.getName()) && newsCategoryRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.NewsCategory.ERR_NAME_EXISTED);
        }
        newsCategoryMapper.updateEntityFromDto(request, category);
        return newsCategoryMapper.toResponseDto(newsCategoryRepository.save(category));
    }

    @Override
    public CommonResponseDto deleteCategory(UUID id) {
        NewsCategory category = newsCategoryRepository.findById(id)
                .orElseThrow(
                        () -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.NewsCategory.ERR_CATEGORY_NOT_FOUND));
        newsCategoryRepository.delete(category);
        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.NewsCategory.DELETE_CATEGORY_SUCCESS);
    }
}
