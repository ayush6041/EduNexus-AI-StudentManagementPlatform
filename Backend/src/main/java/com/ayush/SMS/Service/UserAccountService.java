package com.ayush.SMS.Service;

import com.ayush.SMS.Entity.Role;
import com.ayush.SMS.Entity.Student;
import com.ayush.SMS.Entity.Teacher;
import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;

/** Creates login accounts with a temporary password and emails the credentials after commit. */
@Service
public class UserAccountService {

    private final UserRepo userRepo;
    private final PasswordEncoder encoder;
    private final TemporaryPasswordGenerator generator;
    private final EmailService emailService;

    @Value("${app.temp-password-hours:48}")
    private long tempHours;

    public UserAccountService(UserRepo userRepo, PasswordEncoder encoder,
                              TemporaryPasswordGenerator generator, EmailService emailService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.generator = generator;
        this.emailService = emailService;
    }

    public User createStudentAccount(Student student) {
        String first = student.getName().trim().split("\\s+")[0];
        String base = first + "." + student.getAdmissionNo();
        User user = baseUser(student.getEmail(), uniqueUsername(base), Role.STUDENT);
        user.setStudent(student);
        return issueCredentials(user, student.getName(), student.getAdmissionNo());
    }

    public User createTeacherAccount(Teacher teacher) {
        String base = teacher.getEmail().split("@")[0];
        User user = baseUser(teacher.getEmail(), uniqueUsername(base), Role.TEACHER);
        user.setTeacher(teacher);
        return issueCredentials(user, teacher.getName(), null);
    }

    /** Replaces the password with a fresh temporary one and emails it. */
    public void resendCredentials(User user, String name, String admissionNo) {
        issueCredentials(user, name, admissionNo);
    }

    public String uniqueUsername(String base) {
        String clean = base.toLowerCase().replaceAll("[^a-z0-9._-]", "");
        if (clean.isBlank()) {
            clean = "user";
        }
        String candidate = clean;
        int suffix = 1;
        while (userRepo.existsByUsernameIgnoreCase(candidate)) {
            candidate = clean + (++suffix);
        }
        return candidate;
    }

    private User baseUser(String email, String username, Role role) {
        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setUsername(username);
        user.setRole(role);
        return user;
    }

    private User issueCredentials(User user, String name, String admissionNo) {
        String temp = generator.generate();
        user.setPassword(encoder.encode(temp));
        user.setMustChangePassword(true);
        user.setTempPasswordExpiry(LocalDateTime.now().plusHours(tempHours));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setResetOtpHash(null);
        user.setOtpExpiry(null);
        user.setOtpAttempts(0);
        User saved = userRepo.save(user);

        String email = saved.getEmail();
        String username = saved.getUsername();
        Runnable send = () -> emailService.sendCredentials(email, name, username, admissionNo, temp, tempHours);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    send.run();
                }
            });
        } else {
            send.run();
        }
        return saved;
    }
}
