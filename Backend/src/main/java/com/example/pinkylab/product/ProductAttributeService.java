package com.example.pinkylab.product;

import com.example.pinkylab.product.dto.request.attribute.CreateAttributeRequestDto;
import com.example.pinkylab.product.dto.request.attribute.UpdateAttributeRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.attribute.AttributeResponseDto;

import java.util.List;
import java.util.UUID;

public interface ProductAttributeService {

    List<AttributeResponseDto> getAttributesByProductId(UUID productId);

    AttributeResponseDto getAttributeById(UUID id);

    AttributeResponseDto createAttribute(UUID productId, CreateAttributeRequestDto request);

    AttributeResponseDto updateAttribute(UUID id, UpdateAttributeRequestDto request);

    CommonResponseDto deleteAttribute(UUID id);
}
