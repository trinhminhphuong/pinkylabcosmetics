package com.example.pinkylab.cart;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.cart.dto.request.cart.CartItemRequestDto;
import com.example.pinkylab.product.ProductRepository;
import com.example.pinkylab.product.ProductPromotionRepository;
import com.example.pinkylab.order.ShippingMethodRepository;
import com.example.pinkylab.order.PaymentMethodRepository;
import com.example.pinkylab.cart.dto.request.cart.UpdateCartItemRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.cart.dto.response.cart.CartResponseDto;
import com.example.pinkylab.product.Product;
import com.example.pinkylab.product.ProductPromotion;
import com.example.pinkylab.user.User;
import com.example.pinkylab.shared.exception.VsException;
import com.example.pinkylab.user.*;
import com.example.pinkylab.shared.security.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartServiceImpl implements CartService {

    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    ProductRepository productRepository;
    ProductPromotionRepository productPromotionRepository;
    ShippingMethodRepository shippingMethodRepository;
    PaymentMethodRepository paymentMethodRepository;
    UserRepository userRepository;
    CartMapper cartMapper;

    private Cart getOrCreateCurrentUserCart() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.User.ERR_USER_NOT_EXISTED));

        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = Cart.builder()
                    .user(user)
                    .items(new ArrayList<>())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return cartRepository.save(newCart);
        });
    }

    @Override
    public CartResponseDto getMyCart() {
        Cart cart = getOrCreateCurrentUserCart();
        return cartMapper.toResponseDto(cart);
    }

    @Override
    public CartResponseDto addItem(CartItemRequestDto request) {
        Cart cart = getOrCreateCurrentUserCart();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Product.ERR_PRODUCT_NOT_FOUND));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setPrice(product.getOldPrice()); // Update price potentially
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getOldPrice())
                    .build();
            cart.getItems().add(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cartMapper.toResponseDto(cart);
    }

    @Override
    public CartResponseDto updateItem(UUID itemId, UpdateCartItemRequestDto request) {
        Cart cart = getOrCreateCurrentUserCart();

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Cart.ERR_CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new VsException(HttpStatus.FORBIDDEN, "Item does not belong to your cart");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cartMapper.toResponseDto(cart);
    }

    @Override
    public CommonResponseDto removeItem(UUID itemId) {
        Cart cart = getOrCreateCurrentUserCart();

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND, ErrorMessage.Cart.ERR_CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new VsException(HttpStatus.FORBIDDEN, "Item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Cart.REMOVE_ITEM_SUCCESS);
    }

    @Override
    public CommonResponseDto clearCart() {
        Cart cart = getOrCreateCurrentUserCart();

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setAppliedCoupon(null);
        cart.setShippingMethod(null);
        cart.setPaymentMethod(null);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Cart.CLEAR_CART_SUCCESS);
    }

    @Override
    public CartResponseDto applyPromotion(UUID promotionId) {
        Cart cart = getOrCreateCurrentUserCart();

        ProductPromotion promotion = productPromotionRepository.findById(promotionId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProductPromotion.ERR_PROMOTION_NOT_FOUND));

        if (!promotion.isActive()) {
            throw new VsException(HttpStatus.BAD_REQUEST, "Promotion is no longer active");
        }

        cart.setAppliedCoupon(promotion);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cartMapper.toResponseDto(cart);
    }

    @Override
    public CartResponseDto selectShippingMethod(UUID shippingMethodId) {
        Cart cart = getOrCreateCurrentUserCart();

        ShippingMethod shippingMethod = shippingMethodRepository.findById(shippingMethodId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ShippingMethod.ERR_SHIPPING_METHOD_NOT_FOUND));

        if (!shippingMethod.isActive()) {
            throw new VsException(HttpStatus.BAD_REQUEST, "Shipping method is not available");
        }

        cart.setShippingMethod(shippingMethod);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cartMapper.toResponseDto(cart);
    }

    @Override
    public CartResponseDto selectPaymentMethod(UUID paymentMethodId) {
        Cart cart = getOrCreateCurrentUserCart();

        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.PaymentMethod.ERR_PAYMENT_METHOD_NOT_FOUND));

        if (!paymentMethod.isActive()) {
            throw new VsException(HttpStatus.BAD_REQUEST, "Payment method is not available");
        }

        cart.setPaymentMethod(paymentMethod);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cartMapper.toResponseDto(cart);
    }
}
