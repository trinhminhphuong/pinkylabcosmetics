package com.example.pinkylab.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

        Optional<User> findByEmail(String email);

        boolean existsUserByEmail(String email);

        boolean existsUserByPhone(String phone);

        @Query("SELECT COUNT(u) FROM User u WHERE u.address.id = :addressId")
        long countByAddressId(UUID addressId);

        Page<User> findUserByEmailContainingIgnoreCase(String email, Pageable pageable);

        Page<User> findUserByPhoneContaining(String phone, Pageable pageable);

        @Query("SELECT DATE(u.createdAt) as date, COUNT(u) as count " +
                        "FROM User u " +
                        "WHERE u.createdAt >= :startDate " +
                        "GROUP BY DATE(u.createdAt)")
        List<Object[]> countUserByDay(@Param("startDate") LocalDate startDate);

        @Query("SELECT FUNCTION('DATE_FORMAT', u.createdAt, '%Y-%m'), COUNT(u) " +
                        "FROM User u " +
                        "WHERE u.createdAt >= :startDate " +
                        "GROUP BY FUNCTION('DATE_FORMAT', u.createdAt, '%Y-%m') " +
                        "ORDER BY FUNCTION('DATE_FORMAT', u.createdAt, '%Y-%m') ASC")
        List<Object[]> countUserByMonth(@Param("startDate") LocalDate startDate);

}
