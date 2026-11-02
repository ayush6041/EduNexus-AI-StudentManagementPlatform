package com.ayush.SMS.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** BCrypt hash - never exposed through the API. */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;

    /** True while the user still holds an admin-issued temporary password. */
    @Column(nullable = false)
    private boolean mustChangePassword = false;

    private LocalDateTime tempPasswordExpiry;

    /** Tokens issued before this moment are rejected. */
    private LocalDateTime passwordChangedAt;

    @Column(nullable = false)
    private int failedAttempts = 0;

    private LocalDateTime lockedUntil;

    private String resetOtpHash;

    private LocalDateTime otpExpiry;

    @Column(nullable = false)
    private int otpAttempts = 0;

    @OneToOne
    @JoinColumn(name = "student_id", unique = true)
    private Student student;

    @OneToOne
    @JoinColumn(name = "teacher_id", unique = true)
    private Teacher teacher;
}
