package com.example.pinkylab;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.pinkylab.shared.config.UserInfoProperties;
import com.example.pinkylab.user.Role;
import com.example.pinkylab.user.User;
import com.example.pinkylab.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@SpringBootApplication
@Log4j2
@RequiredArgsConstructor
@EnableConfigurationProperties(UserInfoProperties.class)
public class PinkylabApplication {

	private final UserRepository userRepository;

	public static void main(String[] args) {
		SpringApplication.run(PinkylabApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserInfoProperties userInfo, PasswordEncoder passwordEncoder) {
		return arg -> {
			// init account admin
			if (userRepository.count() == 0) {
				User admin = User.builder()
						.password(passwordEncoder.encode(userInfo.getPassword()))
						.email(userInfo.getEmail())
						.firstName(userInfo.getFirstName())
						.lastName(userInfo.getLastName())
						.phone(userInfo.getPhone())
						.createdAt(LocalDate.now())
						.role(Role.ADMIN)
						.build();
				userRepository.save(admin);
				log.info("Admin user created successfully: {}", userInfo.getEmail());
			} else {
				log.info("Admin user already exists");
			}
		};
	}
}
