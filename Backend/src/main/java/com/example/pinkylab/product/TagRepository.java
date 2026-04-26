package com.example.pinkylab.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    boolean existsByName(String name);

    Optional<Tag> findByName(String name);
}
