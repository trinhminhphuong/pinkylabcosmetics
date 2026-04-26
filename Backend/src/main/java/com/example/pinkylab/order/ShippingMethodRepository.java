package com.example.pinkylab.order;

import com.example.pinkylab.cart.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, UUID> {

    boolean existsByName(String name);
}
