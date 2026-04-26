package com.example.pinkylab.news;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NewsTagRepository extends JpaRepository<NewsTag, UUID> {

    boolean existsByName(String name);
}
