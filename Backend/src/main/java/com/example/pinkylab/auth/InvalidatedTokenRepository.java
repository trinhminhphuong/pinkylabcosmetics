package com.example.pinkylab.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {

    void deleteByExpiryTimeBefore(Date expiryTimeBefore);

    boolean existsById(String id);

}
