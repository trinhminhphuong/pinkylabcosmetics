package com.example.pinkylab.shared.web;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.shared.constant.SuccessMessage;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.dto.pagination.PagingMeta;
import com.example.pinkylab.shared.web.dto.request.member.CreateMemberRequestDto;
import com.example.pinkylab.shared.web.dto.request.member.UpdateMemberRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.shared.web.dto.response.member.MemberResponseDto;
import com.example.pinkylab.shared.exception.VsException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfessionalMemberServiceImpl implements ProfessionalMemberService {

    ProfessionalMemberRepository memberRepository;
    ProfessionalMemberMapper memberMapper;
    Cloudinary cloudinary;

    @Override
    public PaginationResponseDto<MemberResponseDto> getAllMembers(PaginationRequestDto request) {
        Pageable pageable = PageRequest.of(request.getPageNum(), request.getPageSize());

        Page<ProfessionalMember> memberPage = memberRepository.findAll(pageable);

        List<MemberResponseDto> dtos = memberPage.getContent()
                .stream()
                .map(memberMapper::toResponseDto)
                .collect(Collectors.toList());

        PagingMeta pagingMeta = new PagingMeta(
                memberPage.getTotalElements(),
                memberPage.getTotalPages(),
                request.getPageNum() + 1,
                request.getPageSize(),
                null,
                null);

        return new PaginationResponseDto<>(pagingMeta, dtos);
    }

    @Override
    public MemberResponseDto getMemberById(UUID id) {
        ProfessionalMember member = memberRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProfessionalMember.ERR_MEMBER_NOT_FOUND));

        return memberMapper.toResponseDto(member);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MemberResponseDto createMember(CreateMemberRequestDto request) {
        ProfessionalMember member = memberMapper.toEntity(request);
        member.setAvatarUrl("");

        return memberMapper.toResponseDto(memberRepository.save(member));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MemberResponseDto updateMember(UUID id, UpdateMemberRequestDto request) {
        ProfessionalMember member = memberRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProfessionalMember.ERR_MEMBER_NOT_FOUND));

        memberMapper.updateEntityFromDto(request, member);

        return memberMapper.toResponseDto(memberRepository.save(member));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MemberResponseDto uploadAvatar(UUID id, MultipartFile file) {
        ProfessionalMember member = memberRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProfessionalMember.ERR_MEMBER_NOT_FOUND));

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = (String) result.get("secure_url");
            member.setAvatarUrl(imageUrl);
        } catch (Exception e) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.ERR_UPLOAD_IMAGE_FAIL);
        }

        return memberMapper.toResponseDto(memberRepository.save(member));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CommonResponseDto deleteMember(UUID id) {
        ProfessionalMember member = memberRepository.findById(id)
                .orElseThrow(() -> new VsException(HttpStatus.NOT_FOUND,
                        ErrorMessage.ProfessionalMember.ERR_MEMBER_NOT_FOUND));

        memberRepository.delete(member);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.ProfessionalMember.DELETE_MEMBER_SUCCESS);
    }
}
