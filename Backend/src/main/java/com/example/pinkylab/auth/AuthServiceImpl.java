package com.example.pinkylab.auth;

import com.example.pinkylab.shared.constant.*;
import com.example.pinkylab.auth.dto.request.*;
import com.example.pinkylab.auth.dto.request.otp.*;
import com.example.pinkylab.shared.dto.*;
import com.example.pinkylab.auth.dto.response.*;
import com.example.pinkylab.user.dto.response.user.*;
import com.example.pinkylab.user.*;
import com.example.pinkylab.shared.exception.VsException;
import com.example.pinkylab.user.UserRepository;
import com.example.pinkylab.shared.security.UserDetailsServiceImpl;
import com.example.pinkylab.shared.utils.TimeUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jwt.SignedJWT;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    AuthMapper authMapper;
    JwtService jwtService;
    EmailService emailService;
    UserDetailsServiceImpl userDetailsService;

    // New injected services
    OtpService otpService;
    PasswordEncoder passwordEncoder;
    RefreshTokenService refreshTokenService;

    ObjectMapper objectMapper;

    @NonFinal
    @Value("${jwt.access.expiration_time}")
    long ACCESS_TOKEN_EXPIRATION;

    @NonFinal
    @Value("${jwt.refresh.expiration_time}")
    long REFRESH_TOKEN_EXPIRATION;

    @Override
    public LoginResponseDto authentication(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new VsException(
                        HttpStatus.UNAUTHORIZED,
                        ErrorMessage.Auth.ERR_INVALID_CREDENTIALS));

        // Validate password
        boolean auth = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!auth) {
            throw new VsException(HttpStatus.UNAUTHORIZED, ErrorMessage.Auth.ERR_INVALID_CREDENTIALS);
        }

        // Generate tokens
        String accessToken = jwtService.generateToken(user, ACCESS_TOKEN_EXPIRATION);
        String refreshToken = jwtService.generateToken(user, REFRESH_TOKEN_EXPIRATION);

        // Store refresh token in Redis
        String refreshTokenId = jwtService.extractTokenId(refreshToken);
        refreshTokenService.storeRefreshToken(refreshTokenId, user.getEmail(), REFRESH_TOKEN_EXPIRATION / 1000);

        return LoginResponseDto.builder()
                .status(HttpStatus.OK)
                .message(SuccessMessage.Auth.LOGIN_SUCCESS)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .tokenType(CommonConstant.BEARER_TOKEN)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CommonResponseDto logout(LogoutRequestDto request) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(request.getToken());

            String email = jwtService.extractEmail(request.getToken());
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (!jwtService.isTokenValid(request.getToken(), userDetails)) {
                throw new VsException(HttpStatus.UNAUTHORIZED, ErrorMessage.Auth.ERR_TOKEN_INVALIDATED);
            }

            String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            if (invalidatedTokenRepository.existsById(jwtId)) {
                throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.Auth.ERR_TOKEN_ALREADY_INVALIDATED);
            }

            // Invalidate access token
            invalidatedTokenRepository.save(new InvalidatedToken(jwtId, expirationTime));

            // Invalidate all refresh tokens for this user
            refreshTokenService.invalidateAllUserTokens(email);

            return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Auth.LOGOUT_SUCCESS);
        } catch (ParseException e) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.Auth.ERR_GET_TOKEN_CLAIM_SET_FAIL);
        }
    }

    @Override
    public TokenRefreshResponseDto refresh(TokenRefreshRequestDto request) {
        String refreshToken = request.getRefreshToken();
        String refreshTokenId = jwtService.extractTokenId(refreshToken);
        String email = jwtService.extractEmail(refreshToken);

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (jwtService.isTokenExpired(refreshToken)) {
            throw new VsException(HttpStatus.UNAUTHORIZED, ErrorMessage.Auth.EXPIRED_REFRESH_TOKEN);
        }

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new VsException(HttpStatus.UNAUTHORIZED, ErrorMessage.Auth.INVALID_REFRESH_TOKEN);
        }

        // Check if refresh token exists in Redis (not yet used)
        if (!refreshTokenService.isRefreshTokenValid(refreshTokenId)) {
            // Token reuse detected! Invalidate all tokens for this user
            log.warn("Refresh token reuse detected for user: {}. Invalidating all tokens.", email);
            refreshTokenService.invalidateAllUserTokens(email);
            throw new VsException(HttpStatus.UNAUTHORIZED, ErrorMessage.Auth.INVALID_REFRESH_TOKEN);
        }

        // Invalidate the old refresh token immediately (rotation)
        refreshTokenService.invalidateRefreshToken(refreshTokenId);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new VsException(
                        HttpStatus.UNAUTHORIZED,
                        ErrorMessage.User.ERR_USER_NOT_EXISTED));

        // Generate NEW access token and NEW refresh token
        String newAccessToken = jwtService.generateToken(user, ACCESS_TOKEN_EXPIRATION);
        String newRefreshToken = jwtService.generateToken(user, REFRESH_TOKEN_EXPIRATION);

        // Store the new refresh token in Redis
        String newRefreshTokenId = jwtService.extractTokenId(newRefreshToken);
        refreshTokenService.storeRefreshToken(newRefreshTokenId, user.getEmail(), REFRESH_TOKEN_EXPIRATION / 1000);

        return TokenRefreshResponseDto.builder()
                .tokenType(CommonConstant.BEARER_TOKEN)
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    public CommonResponseDto register(RegisterRequestDto request) {

        if (userRepository.existsUserByEmail(request.getEmail())) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.User.ERR_EMAIL_EXISTED);
        }

        String otp = otpService.generateOtp();

        // Store request data as JSON along with OTP
        try {
            String requestJson = objectMapper.writeValueAsString(request);
            otpService.storeOtp(request.getEmail(), otp, OtpType.REGISTRATION, requestJson);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize registration request", e);
            throw new VsException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.ERR_EXCEPTION_GENERAL);
        }

        emailService.sendOtpEmail(request.getEmail(), otp);
        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Auth.SUCCESS_SEND_OTP);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponseDto verifyOtpToRegister(VerifyOtpRequestDto request) {
        if (!otpService.validateOtp(request.getEmail(), request.getOtp(), OtpType.REGISTRATION)) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.Auth.ERR_OTP_INVALID);
        }

        String requestData = otpService.getOtpData(request.getEmail(), OtpType.REGISTRATION);
        if (requestData == null) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.Auth.ERR_OTP_EXPIRED_OR_NOT_FOUND);
        }

        RegisterRequestDto registerRequest;
        try {
            registerRequest = objectMapper.readValue(requestData, RegisterRequestDto.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize registration request", e);
            throw new VsException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.ERR_EXCEPTION_GENERAL);
        }

        User user = authMapper.registerRequestDtoToUser(registerRequest);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.USER);
        user.setCreatedAt(TimeUtil.today());

        userRepository.save(user);

        otpService.clearOtp(request.getEmail(), OtpType.REGISTRATION);

        return authMapper.userToUserResponseDto(user);
    }

    @Override
    public CommonResponseDto forgotPassword(ForgotPasswordRequestDto request) {
        if (!userRepository.existsUserByEmail(request.getEmail())) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.User.ERR_EMAIL_NOT_EXISTED);
        }

        String otp = otpService.generateOtp();

        try {
            String requestJson = objectMapper.writeValueAsString(request);
            otpService.storeOtp(request.getEmail(), otp, OtpType.PASSWORD_RESET, requestJson);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize forgot password request", e);
            throw new VsException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessage.ERR_EXCEPTION_GENERAL);
        }

        emailService.sendOtpEmail(request.getEmail(), otp);

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Auth.SUCCESS_SEND_OTP);
    }

    @Override
    public CommonResponseDto verifyOtpToResetPassword(VerifyOtpRequestDto request) {

        if (!otpService.validateOtp(request.getEmail(), request.getOtp(), OtpType.PASSWORD_RESET)) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.Auth.ERR_OTP_INVALID);
        }

        return new CommonResponseDto(HttpStatus.OK, SuccessMessage.Auth.SUCCESS_VERIFY_OTP);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponseDto resetPassword(ResetPasswordRequestDto request) {
        if (!userRepository.existsUserByEmail(request.getEmail())) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.User.ERR_EMAIL_NOT_EXISTED);
        }

        if (!request.getNewPassword().equals(request.getReEnterPassword())) {
            throw new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.User.ERR_RE_ENTER_PASSWORD_NOT_MATCH);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new VsException(HttpStatus.BAD_REQUEST, ErrorMessage.User.ERR_USER_NOT_EXISTED));

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new VsException(HttpStatus.CONFLICT, ErrorMessage.User.ERR_DUPLICATE_OLD_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpService.clearOtp(request.getEmail(), OtpType.PASSWORD_RESET);

        return authMapper.userToUserResponseDto(user);
    }
}
