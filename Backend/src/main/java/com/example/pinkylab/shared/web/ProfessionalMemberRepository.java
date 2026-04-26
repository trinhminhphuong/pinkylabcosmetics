package com.example.pinkylab.shared.web;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProfessionalMemberRepository extends JpaRepository<ProfessionalMember, UUID> {
}
