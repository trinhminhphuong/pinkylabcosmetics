package com.example.pinkylab.auth;

import com.example.pinkylab.auth.dto.request.*;
import com.example.pinkylab.auth.dto.request.otp.VerifyOtpRequestDto;
import com.example.pinkylab.shared.dto.CommonResponseDto;
import com.example.pinkylab.auth.dto.response.LoginResponseDto;
import com.example.pinkylab.auth.dto.response.TokenRefreshResponseDto;
import com.example.pinkylab.user.dto.response.user.UserResponseDto;

public interface AuthService {

    LoginResponseDto authentication(LoginRequestDto request);

    CommonResponseDto logout(LogoutRequestDto request);

    TokenRefreshResponseDto refresh(TokenRefreshRequestDto request);

    CommonResponseDto register(RegisterRequestDto request);

    UserResponseDto verifyOtpToRegister(VerifyOtpRequestDto request);

    CommonResponseDto forgotPassword(ForgotPasswordRequestDto request);

    CommonResponseDto verifyOtpToResetPassword(VerifyOtpRequestDto request);

    UserResponseDto resetPassword(ResetPasswordRequestDto request);
}
