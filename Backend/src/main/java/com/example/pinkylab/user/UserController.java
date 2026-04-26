package com.example.pinkylab.user;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.user.dto.request.user.personalInformation.PersonalInformationRequestDto;
import com.example.pinkylab.user.dto.request.user.profile.ChangePasswordRequestDto;
import com.example.pinkylab.user.dto.request.user.profile.UpdateProfileRequestDto;
import com.example.pinkylab.user.dto.response.user.UserResponseDto;
import com.example.pinkylab.shared.security.SecurityUtils;
import com.example.pinkylab.shared.dto.pagination.PaginationRequestDto;
import com.example.pinkylab.shared.dto.pagination.PaginationResponseDto;
import com.example.pinkylab.user.dto.request.admin.CreateUserRequestDto;
import com.example.pinkylab.user.dto.request.admin.UpdateUserRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

        UserService userService;

        @Operation(summary = "Điền thông tin cá nhân", description = "Dùng để người dùng điền thông tin cá nhân", security = @SecurityRequirement(name = "Bearer Token"))
        @PostMapping(UrlConstant.User.FILL_PERSONAL_INFORMATION)
        public ResponseEntity<RestData<UserResponseDto>> fillPersonalInformation(
                        @Valid @RequestBody PersonalInformationRequestDto request) {
                UUID userId = SecurityUtils.getCurrentUserId();
                UserResponseDto response = userService.personalInformation(userId, request);
                return VsResponseUtil.success(response);
        }

        @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu của người dùng hiện tại", security = @SecurityRequirement(name = "Bearer Token"))
        @PostMapping(UrlConstant.User.CHANGE_PASSWORD)
        public ResponseEntity<RestData<CommonResponseDto>> changePassword(
                        @Valid @RequestBody com.example.pinkylab.user.dto.request.ChangePasswordRequestDto request) {
                UUID userId = SecurityUtils.getCurrentUserId();
                CommonResponseDto response = userService.changePassword(userId, request);
                return VsResponseUtil.success(response);
        }

        @Operation(summary = "Tải lên ảnh đại diện", description = "Dùng để người dùng tải lên ảnh đại diện", security = @SecurityRequirement(name = "Bearer Token"))
        @PostMapping(UrlConstant.User.UPLOAD_AVATAR)
        public ResponseEntity<RestData<UserResponseDto>> uploadAvatar(
                        @RequestParam("file") MultipartFile file) {
                UUID userId = SecurityUtils.getCurrentUserId();
                UserResponseDto response = userService.uploadAvatar(userId, file);
                return VsResponseUtil.success(response);
        }

        @Operation(summary = "Lấy thông tin profile (thông tin user và user health)", description = "Dùng để người dùng lấy thông tin profile đầy đủ (thông tin cá nhân + sức khỏe)", security = @SecurityRequirement(name = "Bearer Token"))
        @GetMapping(UrlConstant.User.GET_PROFILE)
        public ResponseEntity<RestData<UserResponseDto>> getMyProfile() {
                UUID userId = SecurityUtils.getCurrentUserId();
                UserResponseDto response = userService.getMyProfile(userId);
                return VsResponseUtil.success(response);
        }

        @Operation(summary = "Cập nhật thông tin profile", description = "Dùng để người dùng cập nhật thông tin cá nhân và sức khỏe với xác nhận mật khẩu", security = @SecurityRequirement(name = "Bearer Token"))
        @PutMapping(UrlConstant.User.UPDATE_PROFILE)
        public ResponseEntity<RestData<UserResponseDto>> updateProfile(
                        @Valid @RequestBody UpdateProfileRequestDto request) {
                UUID userId = SecurityUtils.getCurrentUserId();
                UserResponseDto response = userService.updateProfile(request, userId);
                return VsResponseUtil.success(response);
        }

        @Operation(summary = "Cập nhật địa chỉ thanh toán", description = "Dùng để người dùng cập nhật địa chỉ thanh toán mặc định", security = @SecurityRequirement(name = "Bearer Token"))
        @PutMapping(UrlConstant.User.UPDATE_BILLING_ADDRESS)
        public ResponseEntity<RestData<UserResponseDto>> updateBillingAddress(
                        @Valid @RequestBody com.example.pinkylab.order.dto.request.order.AddressDto request) {
                UUID userId = SecurityUtils.getCurrentUserId();
                UserResponseDto response = userService.updateBillingAddress(userId, request);
                return VsResponseUtil.success(response);
        }

        // //
        // Methods for ADMIN //
        // //

        @Tag(name = "admin-controller")
        @Operation(summary = "Lấy thông tin của toàn bộ user", description = "Dùng để admin lấy thông tin toàn bộ user", security = @SecurityRequirement(name = "Bearer Token"))
        @GetMapping(UrlConstant.Admin.GET_USERS)
        public ResponseEntity<RestData<PaginationResponseDto<UserResponseDto>>> getAllUsers(
                        @ModelAttribute PaginationRequestDto request) {
                PaginationResponseDto<UserResponseDto> response = userService.getAllUsers(request);
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Lấy thông tin user theo ID", description = "Dùng để admin lấy thông tin chi tiết của một user", security = @SecurityRequirement(name = "Bearer Token"))
        @GetMapping(UrlConstant.Admin.GET_USER)
        public ResponseEntity<RestData<UserResponseDto>> getUserById(@PathVariable String userId) {
                UserResponseDto response = userService.getUserById(UUID.fromString(userId));
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Tạo user mới", description = "Dùng để admin tạo user mới trong hệ thống", security = @SecurityRequirement(name = "Bearer Token"))
        @PostMapping(UrlConstant.Admin.CREATE_USER)
        public ResponseEntity<RestData<UserResponseDto>> createUser(
                        @Valid @RequestBody CreateUserRequestDto request) {
                UserResponseDto response = userService.createUser(request);
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Cập nhật thông tin user", description = "Dùng để admin cập nhật thông tin của một user", security = @SecurityRequirement(name = "Bearer Token"))
        @PutMapping(UrlConstant.Admin.UPDATE_USER)
        public ResponseEntity<RestData<UserResponseDto>> updateUser(
                        @PathVariable String userId,
                        @Valid @RequestBody UpdateUserRequestDto request) {
                UserResponseDto response = userService.updateUser(UUID.fromString(userId), request);
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Xóa user vĩnh viễn", description = "Dùng để admin xóa user khỏi hệ thống (không thể khôi phục)", security = @SecurityRequirement(name = "Bearer Token"))
        @DeleteMapping(UrlConstant.Admin.DELETE_USER)
        public ResponseEntity<RestData<CommonResponseDto>> deleteUserPermanently(@PathVariable String userId) {
                CommonResponseDto response = userService.deleteUserAccount(UUID.fromString(userId));
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Tìm kiếm user bằng tên", description = "Dùng để admin tìm kiếm người dùng bằng tên", security = @SecurityRequirement(name = "Bearer Token"))
        @GetMapping(UrlConstant.Admin.SEARCH_USER_BY_USERNAME)
        public ResponseEntity<RestData<PaginationResponseDto<UserResponseDto>>> searchUserByUsername(
                        @RequestParam(required = true) String searchSentence,
                        @ModelAttribute PaginationRequestDto request) {
                PaginationResponseDto<UserResponseDto> response = userService.searchUserByUsername(searchSentence,
                                request);
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Tìm kiếm user bằng email", description = "Dùng để admin tìm kiếm người dùng bằng email", security = @SecurityRequirement(name = "Bearer Token"))
        @GetMapping(UrlConstant.Admin.SEARCH_USER_BY_EMAIL)
        public ResponseEntity<RestData<PaginationResponseDto<UserResponseDto>>> searchUserByEmail(
                        @RequestParam(required = true) String searchSentence,
                        @ModelAttribute PaginationRequestDto request) {
                PaginationResponseDto<UserResponseDto> response = userService.searchUserByEmail(searchSentence, request);
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Tìm kiếm user bằng số điện thoại", description = "Dùng để admin tìm kiếm người dùng bằng số điện thoại", security = @SecurityRequirement(name = "Bearer Token"))
        @GetMapping(UrlConstant.Admin.SEARCH_USER_BY_PHONE)
        public ResponseEntity<RestData<PaginationResponseDto<UserResponseDto>>> searchUserByPhone(
                        @RequestParam(required = true) String searchSentence,
                        @ModelAttribute PaginationRequestDto request) {
                PaginationResponseDto<UserResponseDto> response = userService.searchUserByPhone(searchSentence, request);
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Khóa tài khoản", description = "Dùng để admin khóa tài khoản người dùng", security = @SecurityRequirement(name = "Bearer Token"))
        @PostMapping(UrlConstant.Admin.LOCK_USER)
        public ResponseEntity<RestData<UserResponseDto>> lockUser(@PathVariable String userId) {
                UserResponseDto response = userService.lockUser(UUID.fromString(userId));
                return VsResponseUtil.success(response);
        }

        @Tag(name = "admin-controller")
        @Operation(summary = "Mở khóa tài khoản", description = "Dùng để admin mở khóa tài khoản người dùng", security = @SecurityRequirement(name = "Bearer Token"))
        @PostMapping(UrlConstant.Admin.UNLOCK_USER)
        public ResponseEntity<RestData<UserResponseDto>> unlockUser(@PathVariable String userId) {
                UserResponseDto response = userService.unlockUser(UUID.fromString(userId));
                return VsResponseUtil.success(response);
        }
}
