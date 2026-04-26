package com.example.pinkylab.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@ConfigurationProperties("app.admin")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInfoProperties {
    String email;
    String password;
    String firstName;
    String lastName;
    String phone;
}
