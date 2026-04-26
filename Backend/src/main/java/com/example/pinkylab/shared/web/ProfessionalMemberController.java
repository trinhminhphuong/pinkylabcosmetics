package com.example.pinkylab.shared.web;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.shared.web.dto.request.member.CreateMemberRequestDto;
import com.example.pinkylab.shared.web.dto.request.member.UpdateMemberRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.shared.web.dto.response.member.MemberResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfessionalMemberController {

    ProfessionalMemberService memberService;

    // ==================== PUBLIC ====================

    @Operation(summary = "Lấy danh sách thành viên", description = "Lấy danh sách thành viên chuyên nghiệp (bác sĩ, cố vấn,...) có phân trang")
    @GetMapping(UrlConstant.ProfessionalMember.GET_ALL_MEMBERS)
    public ResponseEntity<RestData<PaginationResponseDto<MemberResponseDto>>> getAllMembers(
            @ModelAttribute PaginationRequestDto request) {
        PaginationResponseDto<MemberResponseDto> response = memberService.getAllMembers(request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Lấy chi tiết thành viên", description = "Lấy chi tiết thông tin của một đội ngũ")
    @GetMapping(UrlConstant.ProfessionalMember.GET_MEMBER_BY_ID)
    public ResponseEntity<RestData<MemberResponseDto>> getMemberById(@PathVariable UUID id) {
        MemberResponseDto response = memberService.getMemberById(id);
        return VsResponseUtil.success(response);
    }

    // ==================== ADMIN ====================

    @Operation(summary = "Tạo thành viên mới", description = "Thêm một thành viên chuyên gia mới", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.ProfessionalMember.CREATE_MEMBER)
    public ResponseEntity<RestData<MemberResponseDto>> createMember(
            @Valid @RequestBody CreateMemberRequestDto request) {
        MemberResponseDto response = memberService.createMember(request);
        return VsResponseUtil.success(HttpStatus.CREATED, response);
    }

    @Operation(summary = "Tải lên avatar của thành viên", description = "Cập nhật ảnh đại diện cho thành viên", security = @SecurityRequirement(name = "Bearer Token"))
    @PostMapping(UrlConstant.ProfessionalMember.UPDATE_MEMBER_AVATAR)
    public ResponseEntity<RestData<MemberResponseDto>> uploadAvatar(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        MemberResponseDto response = memberService.uploadAvatar(id, file);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Cập nhật thông tin thành viên", description = "Cập nhật chức vụ hoặc tên của thành viên", security = @SecurityRequirement(name = "Bearer Token"))
    @PutMapping(UrlConstant.ProfessionalMember.UPDATE_MEMBER)
    public ResponseEntity<RestData<MemberResponseDto>> updateMember(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMemberRequestDto request) {
        MemberResponseDto response = memberService.updateMember(id, request);
        return VsResponseUtil.success(response);
    }

    @Operation(summary = "Xóa diễn đàn", description = "Xóa thông tin của một thành viên trong đội ngũ", security = @SecurityRequirement(name = "Bearer Token"))
    @DeleteMapping(UrlConstant.ProfessionalMember.DELETE_MEMBER)
    public ResponseEntity<RestData<CommonResponseDto>> deleteMember(@PathVariable UUID id) {
        CommonResponseDto response = memberService.deleteMember(id);
        return VsResponseUtil.success(response);
    }
}
