package com.example.pinkylab.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, UUID> {

    List<ProductAttribute> findByProductId(UUID productId);

    boolean existsByProductIdAndAttributeKey(UUID productId, String attributeKey);
}
