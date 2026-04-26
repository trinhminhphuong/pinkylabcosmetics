package com.example.pinkylab.order;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.cart.dto.request.cart.ShippingMethodRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.ShippingMethodResponseDto;
import com.example.pinkylab.cart.ShippingMethod;
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
public class ShippingMethodServiceImpl implements ShippingMethodService {

    ShippingMethodRepository shippingMethodRepository;
    ShippingMethodMapper shippingMethodMapper;

    @Override
    public PaginationResponseDto<ShippingMethodResponseDto> getAllShippingMethods(PaginationRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());
        Page<ShippingMethod> page = shippingMethodRepository.findAll(pageable);

        List<ShippingMethodResponseDto> dtos = page.getContent()
                .stream()
                .map(shippingMethodMapper::toResponseDto)
                .collect(Collectors.toList());

        PagingMeta pagingMeta = new PagingMeta(
                page.getTotalElements(),
                page.getTotalPages(),
                request.getPageNum() + 1,
                request.getPageSize(),
                null, null);

        return new PaginationResponseDto<>(pagingMeta, dtos);
    }

    @Override
    public ShippingMethodResponseDto getShippingMethodById(UUID id) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ShippingMethod.ERR_SHIPPING_METHOD_NOT_FOUND));

        return shippingMethodMapper.toResponseDto(shippingMethod);
    }

    @Override
    public ShippingMethodResponseDto createShippingMethod(ShippingMethodRequestDto request) {
        if (shippingMethodRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, "Shipping method name already existed");
        }
        ShippingMethod shippingMethod = shippingMethodMapper.toEntity(request);
        return shippingMethodMapper.toResponseDto(shippingMethodRepository.save(shippingMethod));
    }

    @Override
    public ShippingMethodResponseDto updateShippingMethod(UUID id, ShippingMethodRequestDto request) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ShippingMethod.ERR_SHIPPING_METHOD_NOT_FOUND));

        if (!shippingMethod.getName().equals(request.getName())
                && shippingMethodRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, "Shipping method name already existed");
        }

        shippingMethodMapper.updateEntityFromDto(request, shippingMethod);
        return shippingMethodMapper.toResponseDto(shippingMethodRepository.save(shippingMethod));
    }

    @Override
    public CommonResponseDto deleteShippingMethod(UUID id) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ShippingMethod.ERR_SHIPPING_METHOD_NOT_FOUND));

        shippingMethodRepository.delete(shippingMethod);
        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.ShippingMethod.DELETE_SHIPPING_METHOD_SUCCESS);
    }
}
