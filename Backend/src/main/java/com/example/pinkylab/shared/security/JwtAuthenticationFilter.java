package com.example.pinkylab.shared.security;

import com.example.pinkylab.shared.constant.ErrorMessage;
import com.example.pinkylab.auth.InvalidatedTokenRepository;
import com.example.pinkylab.auth.JwtServiceImpl;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;

@Slf4j
@Component
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  JwtServiceImpl jwtService;

  UserDetailsServiceImpl userDetailsService;

  InvalidatedTokenRepository invalidatedTokenRepository;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      log.debug("No Bearer token found in request: {}", request.getRequestURI());
      filterChain.doFilter(request, response);
      return;
    }

    String token = authHeader.substring(7);

    try {
      SignedJWT signedJWT = SignedJWT.parse(token);

      String jwtId = signedJWT.getJWTClaimsSet().getJWTID();

      if (invalidatedTokenRepository.existsById(jwtId)) {
        log.warn("Token invalidated for request: {}", request.getRequestURI());
      } else {
        String email = jwtService.extractEmail(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
          UserDetails userDetails = userDetailsService.loadUserByUsername(email);

          if (jwtService.isTokenValid(token, userDetails)) {
            log.debug("Token valid for user: {}", email);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
                null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.info("Authenticated user: {}, Authorities: {}", email, userDetails.getAuthorities());
          } else {
            log.warn("Invalid token for user: {}", email);
          }
        }
      }

    } catch (Exception e) {
      log.warn("Failed to parse JWT token: {}", e.getMessage());
    }

    filterChain.doFilter(request, response);
  }
}
