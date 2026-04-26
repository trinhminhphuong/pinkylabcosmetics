package com.example.pinkylab.product;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.product.dto.request.product.CreateProductRequestDto;
import com.example.pinkylab.product.dto.request.product.UpdateProductRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.product.ProductResponseDto;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductServiceImpl implements ProductService {

  ProductRepository productRepository;
  BrandRepository brandRepository;
  CategoryRepository categoryRepository;
  TagRepository tagRepository;
  ProductMapper productMapper;
  Cloudinary cloudinary;

  @Override
  public PaginationResponseDto<ProductResponseDto> getAllProducts(PaginationRequestDto request) {
    Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());

    Page<Product> productPage = productRepository.findWithFilters(
        request.getCategoryId(),
        request.getBrandId(),
        request.getKeyword(),
        pageable);

    List<ProductResponseDto> dtos = productPage.getContent()
        .stream()
        .map(productMapper::toResponseDto)
        .collect(Collectors.toList());

    PagingMeta pagingMeta = new PagingMeta(
        productPage.getTotalElements(),
        productPage.getTotalPages(),
        request.getPageNum() + 1,
        request.getPageSize(),
        null,
        null);

    return new PaginationResponseDto<>(pagingMeta, dtos);
  }

  @Override
  public ProductResponseDto getProductById(UUID id) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

    return productMapper.toResponseDto(product);
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public ProductResponseDto createProduct(CreateProductRequestDto request) {
    Brand brand = brandRepository.findById(request.getBrandId())
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Brand.ERR_BRAND_NOT_FOUND));

    Category category = categoryRepository.findById(request.getCategoryId())
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Category.ERR_CATEGORY_NOT_FOUND));

    List<Tag> tags = new ArrayList<>();
    if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
      tags = tagRepository.findAllById(request.getTagIds());
    }

    Product product = productMapper.toEntity(request);
    product.setBrand(brand);
    product.setCategory(category);
    product.setTags(tags);
    product.setImageUrl(new ArrayList<>()); // Images will be uploaded later
    product.setCreatedAt(com.example.pinkylab.shared.utils.TimeUtil.today().toString());
    product.setUpdatedAt(com.example.pinkylab.shared.utils.TimeUtil.today().toString());

    return productMapper.toResponseDto(productRepository.save(product));
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public ProductResponseDto updateProduct(UUID id, UpdateProductRequestDto request) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

    if (request.getBrandId() != null && !product.getBrand().getId().equals(request.getBrandId())) {
      Brand brand = brandRepository.findById(request.getBrandId())
          .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Brand.ERR_BRAND_NOT_FOUND));
      product.setBrand(brand);
    }

    if (request.getCategoryId() != null && !product.getCategory().getId().equals(request.getCategoryId())) {
      Category category = categoryRepository.findById(request.getCategoryId())
          .orElseThrow(
              () -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Category.ERR_CATEGORY_NOT_FOUND));
      product.setCategory(category);
    }

    if (request.getTagIds() != null) {
      List<Tag> tags = tagRepository.findAllById(request.getTagIds());
      product.setTags(tags);
    }

    if (request.getSku() != null) {
      product.setSku(request.getSku());
    }

    if (request.getImageUrl() != null) {
      product.setImageUrl(request.getImageUrl());
    }

    productMapper.updateEntityFromDto(request, product);
    product.setUpdatedAt(com.example.pinkylab.shared.utils.TimeUtil.today().toString());

    return productMapper.toResponseDto(productRepository.save(product));
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public ProductResponseDto uploadImages(UUID id, List<MultipartFile> files) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

    List<String> imageUrls = product.getImageUrl() != null ? product.getImageUrl() : new ArrayList<>();

    for (MultipartFile file : files) {
      try {
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        String imageUrl = (String) result.get("secure_url");
        imageUrls.add(imageUrl);
      } catch (Exception e) {
        throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.ERR_UPLOAD_IMAGE_FAIL);
      }
    }

    product.setImageUrl(imageUrls);
    product.setUpdatedAt(com.example.pinkylab.shared.utils.TimeUtil.today().toString());

    return productMapper.toResponseDto(productRepository.save(product));
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public CommonResponseDto deleteProduct(UUID id) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

    productRepository.delete(product);

    return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Product.DELETE_PRODUCT_SUCCESS);
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public ProductResponseDto addTagsToProduct(UUID id, List<UUID> tagIds) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

    List<Tag> existingTags = product.getTags();
    List<Tag> newTags = tagRepository.findAllById(tagIds);

    for (Tag tag : newTags) {
      if (!existingTags.contains(tag)) {
        existingTags.add(tag);
      }
    }

    product.setTags(existingTags);
    product.setUpdatedAt(com.example.pinkylab.shared.utils.TimeUtil.today().toString());

    return productMapper.toResponseDto(productRepository.save(product));
  }

  @Override
  @Transactional(rollbackFor = Exception.class)
  public ProductResponseDto removeTagFromProduct(UUID id, UUID tagId) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

    Tag tagToRemove = tagRepository.findById(tagId)
        .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Tag.ERR_TAG_NOT_FOUND));

    List<Tag> tags = product.getTags();
    tags.remove(tagToRemove);

    product.setTags(tags);
    product.setUpdatedAt(com.example.pinkylab.shared.utils.TimeUtil.today().toString());

    return productMapper.toResponseDto(productRepository.save(product));
  }
}
