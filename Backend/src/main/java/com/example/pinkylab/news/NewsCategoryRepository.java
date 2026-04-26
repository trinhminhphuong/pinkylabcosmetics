package com.example.pinkylab.news;

import com.example.pinkylab.news.dto.response.category.NewsCategoryCountDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NewsCategoryRepository extends JpaRepository<NewsCategory, UUID> {

    boolean existsByName(String name);

    @Query("SELECT new com.example.pinkylab.news.dto.response.category.NewsCategoryCountDto(c.id, c.name, COUNT(n)) " +
            "FROM NewsCategory c LEFT JOIN c.newsList n " +
            "GROUP BY c.id, c.name " +
            "ORDER BY COUNT(n) DESC")
    List<NewsCategoryCountDto> findNewsCategoryCounts();
}
