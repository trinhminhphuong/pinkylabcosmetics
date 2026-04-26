package com.example.pinkylab.order;

import com.example.pinkylab.order.dto.response.order.OrderItemResponseDto;
import com.example.pinkylab.order.dto.response.order.OrderResponseDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {
        AddressOrderMapper.class }, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", expression = "java(order.getUser() != null ? order.getUser().getFirstName() + \" \" + order.getUser().getLastName() : null)")
    @Mapping(target = "paymentMethodId", source = "paymentMethod.id")
    @Mapping(target = "paymentMethodName", source = "paymentMethod.name")
    OrderResponseDto toResponseDto(Order order);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productImageUrl", expression = "java(orderItem.getProduct().getImageUrl() != null && !orderItem.getProduct().getImageUrl().isEmpty() ? orderItem.getProduct().getImageUrl().get(0) : null)")
    OrderItemResponseDto orderItemToResponseDto(OrderItem orderItem);
}
