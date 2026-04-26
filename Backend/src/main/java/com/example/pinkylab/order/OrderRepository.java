package com.example.pinkylab.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT MAX(CAST(SUBSTRING(o.orderNumber, 2) AS int)) FROM Order o")
    Integer findMaxOrderNumber();

    Page<Order> findByUserId(UUID userId, Pageable pageable);

}
