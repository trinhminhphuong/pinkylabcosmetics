package com.example.pinkylab.order;

import com.example.pinkylab.order.dto.request.order.AddressDto;
import com.example.pinkylab.order.dto.response.order.AddressResponseDto;
import com.example.pinkylab.user.Address;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface AddressOrderMapper {

    AddressResponseDto toResponseDto(Address address);

    @Mapping(target = "id", ignore = true)
    Address toEntity(AddressDto request);

}
