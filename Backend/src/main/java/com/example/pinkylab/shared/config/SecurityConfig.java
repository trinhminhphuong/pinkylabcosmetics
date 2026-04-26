package com.example.pinkylab.shared.config;

import com.example.pinkylab.shared.constant.RoleConstant;
import com.example.pinkylab.shared.security.JwtAuthenticationFilter;
import com.example.pinkylab.shared.security.RequestLogFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Inject as String then split manually — Spring @Value String[] does NOT
    // automatically split comma-separated values from .properties files.
    @Value("${security.public-endpoints}")
    private String publicEndpointsRaw;

    @Value("${security.public-get-endpoints}")
    private String publicGetEndpointsRaw;

    @Value("${security.user-endpoints}")
    private String userEndpointsRaw;

    @Value("${security.admin-endpoints}")
    private String adminEndpointsRaw;

    @Value("${security.swagger-endpoints}")
    private String swaggerEndpointsRaw;

    @Value("${app.frontend.origin:http://localhost:5173}")
    private String frontendOrigin;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RequestLogFilter requestLogFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RequestLogFilter requestLogFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.requestLogFilter = requestLogFilter;
    }

    /** Split a comma-separated property value into a trimmed String array. */
    private static String[] split(String raw) {
        if (raw == null || raw.isBlank())
            return new String[0];
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        String[] PUBLIC_END_POINT = split(publicEndpointsRaw);
        String[] PUBLIC_GET_END_POINT = split(publicGetEndpointsRaw);
        String[] USER_END_POINT = split(userEndpointsRaw);
        String[] ADMIN_END_POINT = split(adminEndpointsRaw);
        String[] OPEN_API = split(swaggerEndpointsRaw);

        http.cors(Customizer.withDefaults());
        http.csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests(request -> request
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(PUBLIC_END_POINT).permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, PUBLIC_GET_END_POINT).permitAll()
                .requestMatchers(USER_END_POINT).hasAnyAuthority(RoleConstant.USER, RoleConstant.ADMIN)
                .requestMatchers(ADMIN_END_POINT).hasAuthority(RoleConstant.ADMIN)
                .requestMatchers(OPEN_API).permitAll()
                .anyRequest().authenticated());

        http.addFilterBefore(requestLogFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of(frontendOrigin, "http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(
                java.util.List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(com.example.pinkylab.shared.constant.CommonConstant.BCRYPT_STRENGTH);
    }
}
