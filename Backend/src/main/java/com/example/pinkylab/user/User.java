package com.example.pinkylab.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  UUID id;

  @Column(nullable = false)
  @JsonIgnore
  String password;

  @Column(nullable = false)
  String email;

  @Nationalized
  String firstName;

  @Nationalized
  String lastName;

  String phone;

  String linkAvatar;

  String avatarPublicId;

  @Column(nullable = false)
  LocalDate createdAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  Role role;

  @ManyToOne
  @JoinColumn(name = "address_id")
  Address address;

  @Column(nullable = false, columnDefinition = "boolean default true")
  @Builder.Default
  Boolean enabled = true;
}
