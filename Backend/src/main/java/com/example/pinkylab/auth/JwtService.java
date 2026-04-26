package com.example.pinkylab.auth;

import com.example.pinkylab.user.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

public interface JwtService {

    String generateToken(User user, long expirationTime);

    String extractEmail(String token);

    Date extractExpiration(String token);

    boolean isTokenValid(String token, UserDetails userDetails);

    boolean isTokenExpired(String token);

    String extractTokenId(String token);

}
