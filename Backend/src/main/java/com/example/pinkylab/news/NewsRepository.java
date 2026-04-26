package com.example.pinkylab.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NewsRepository extends JpaRepository<News, UUID> {

       @Query("SELECT n FROM News n LEFT JOIN n.tags t WHERE " +
                     "(:categoryId IS NULL OR n.category.id = :categoryId) AND " +
                     "(:tagId IS NULL OR t.id = :tagId)")
       Page<News> findNewsWithFilters(@Param("categoryId") UUID categoryId,
                     @Param("tagId") UUID tagId,
                     Pageable pageable);
}
