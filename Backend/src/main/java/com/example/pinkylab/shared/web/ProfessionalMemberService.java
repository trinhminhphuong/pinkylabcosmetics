package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.web.dto.request.member.CreateMemberRequestDto;
import com.example.pinkylab.shared.web.dto.request.member.UpdateMemberRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.shared.web.dto.response.member.MemberResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ProfessionalMemberService {

    PaginationResponseDto<MemberResponseDto> getAllMembers(PaginationRequestDto request);

    MemberResponseDto getMemberById(UUID id);

    MemberResponseDto createMember(CreateMemberRequestDto request);

    MemberResponseDto updateMember(UUID id, UpdateMemberRequestDto request);

    MemberResponseDto uploadAvatar(UUID id, MultipartFile file);

    CommonResponseDto deleteMember(UUID id);
}
