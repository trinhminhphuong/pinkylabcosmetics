package com.example.pinkylab.product;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.product.dto.request.product.CreateProductRequestDto;
import com.example.pinkylab.product.dto.request.product.UpdateProductRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.product.ProductResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProductService {

  PaginationResponseDto<ProductResponseDto> getAllProducts(PaginationRequestDto request);

  ProductResponseDto getProductById(UUID id);

  ProductResponseDto createProduct(CreateProductRequestDto request);

  ProductResponseDto updateProduct(UUID id, UpdateProductRequestDto request);

  ProductResponseDto uploadImages(UUID id, List<MultipartFile> files);

  CommonResponseDto deleteProduct(UUID id);

  ProductResponseDto addTagsToProduct(UUID id, List<UUID> tagIds);

  ProductResponseDto removeTagFromProduct(UUID id, UUID tagId);
}
