package com.example.pinkylab.product;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.product.dto.request.attribute.CreateAttributeRequestDto;
import com.example.pinkylab.product.dto.request.attribute.UpdateAttributeRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.product.dto.response.attribute.AttributeResponseDto;
import com.example.pinkylab.shared.exception.VsException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductAttributeServiceImpl implements ProductAttributeService {

    ProductAttributeRepository attributeRepository;
    ProductRepository productRepository;
    ProductAttributeMapper attributeMapper;

    @Override
    public List<AttributeResponseDto> getAttributesByProductId(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND);
        }

        List<ProductAttribute> attributes = attributeRepository.findByProductId(productId);

        return attributes.stream()
                .map(attributeMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public AttributeResponseDto getAttributeById(UUID id) {
        ProductAttribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProductAttribute.ERR_ATTRIBUTE_NOT_FOUND));

        return attributeMapper.toResponseDto(attribute);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AttributeResponseDto createAttribute(UUID productId, CreateAttributeRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

        if (attributeRepository.existsByProductIdAndAttributeKey(productId, request.getAttributeKey())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.ProductAttribute.ERR_ATTRIBUTE_KEY_EXISTED);
        }

        ProductAttribute attribute = attributeMapper.toEntity(request);
        attribute.setProduct(product);

        return attributeMapper.toResponseDto(attributeRepository.save(attribute));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AttributeResponseDto updateAttribute(UUID id, UpdateAttributeRequestDto request) {
        ProductAttribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProductAttribute.ERR_ATTRIBUTE_NOT_FOUND));

        if (request.getAttributeKey() != null && !request.getAttributeKey().equals(attribute.getAttributeKey())) {
            if (attributeRepository.existsByProductIdAndAttributeKey(attribute.getProduct().getId(),
                    request.getAttributeKey())) {
                throw new VsException(HttpStatus.CONFLICT, ErrorMessage.ProductAttribute.ERR_ATTRIBUTE_KEY_EXISTED);
            }
        }

        attributeMapper.updateEntityFromDto(request, attribute);

        return attributeMapper.toResponseDto(attributeRepository.save(attribute));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CommonResponseDto deleteAttribute(UUID id) {
        ProductAttribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProductAttribute.ERR_ATTRIBUTE_NOT_FOUND));

        attributeRepository.delete(attribute);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.ProductAttribute.DELETE_ATTRIBUTE_SUCCESS);
    }
}
