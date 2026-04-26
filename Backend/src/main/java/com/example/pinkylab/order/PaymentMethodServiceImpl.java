package com.example.pinkylab.order;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.cart.dto.request.cart.PaymentMethodRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.PaymentMethodResponseDto;
import com.example.pinkylab.cart.PaymentMethod;
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
public class PaymentMethodServiceImpl implements PaymentMethodService {

    PaymentMethodRepository paymentMethodRepository;
    PaymentMethodMapper paymentMethodMapper;

    @Override
    public PaginationResponseDto<PaymentMethodResponseDto> getAllPaymentMethods(PaginationRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());
        Page<PaymentMethod> page = paymentMethodRepository.findAll(pageable);

        List<PaymentMethodResponseDto> dtos = page.getContent()
                .stream()
                .map(paymentMethodMapper::toResponseDto)
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
    public PaymentMethodResponseDto getPaymentMethodById(UUID id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.PaymentMethod.ERR_PAYMENT_METHOD_NOT_FOUND));

        return paymentMethodMapper.toResponseDto(paymentMethod);
    }

    @Override
    public PaymentMethodResponseDto createPaymentMethod(PaymentMethodRequestDto request) {
        if (paymentMethodRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.PaymentMethod.ERR_NAME_EXISTED);
        }
        PaymentMethod paymentMethod = paymentMethodMapper.toEntity(request);
        return paymentMethodMapper.toResponseDto(paymentMethodRepository.save(paymentMethod));
    }

    @Override
    public PaymentMethodResponseDto updatePaymentMethod(UUID id, PaymentMethodRequestDto request) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.PaymentMethod.ERR_PAYMENT_METHOD_NOT_FOUND));

        if (!paymentMethod.getName().equals(request.getName())
                && paymentMethodRepository.existsByName(request.getName())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.PaymentMethod.ERR_NAME_EXISTED);
        }
        paymentMethodMapper.updateEntityFromDto(request, paymentMethod);
        return paymentMethodMapper.toResponseDto(paymentMethodRepository.save(paymentMethod));
    }

    @Override
    public CommonResponseDto deletePaymentMethod(UUID id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.PaymentMethod.ERR_PAYMENT_METHOD_NOT_FOUND));
        paymentMethodRepository.delete(paymentMethod);
        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.PaymentMethod.DELETE_PAYMENT_METHOD_SUCCESS);
    }
}
