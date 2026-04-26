package com.example.pinkylab.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

  Page<Product> findByCategoryId(UUID categoryId, Pageable pageable);

  Page<Product> findByBrandId(UUID brandId, Pageable pageable);

  @Query("SELECT p FROM Product p WHERE " +
      "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
      "(:brandId    IS NULL OR p.brand.id    = :brandId)    AND " +
      "(:keyword    IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
  Page<Product> findWithFilters(
      @Param("categoryId") UUID categoryId,
      @Param("brandId") UUID brandId,
      @Param("keyword") String keyword,
      Pageable pageable);
}
