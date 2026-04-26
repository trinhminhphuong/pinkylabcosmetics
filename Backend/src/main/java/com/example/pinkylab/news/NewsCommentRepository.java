package com.example.pinkylab.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NewsCommentRepository extends JpaRepository<NewsComment, UUID> {

    Page<NewsComment> findByNewsId(UUID newsId, Pageable pageable);
}
