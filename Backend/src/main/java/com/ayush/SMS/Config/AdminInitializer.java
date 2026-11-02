package com.ayush.SMS.Config;

import com.ayush.SMS.Entity.Role;
import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/** Creates the default SUPER_ADMIN on first start (credentials come from configuration). */
@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepo userRepo;
    private final PasswordEncoder encoder;

    @Value("${app.admin.username}")
    private String username;
    @Value("${app.admin.email}")
    private String email;
    @Value("${app.admin.password}")
    private String password;

    public AdminInitializer(UserRepo userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (userRepo.existsByRole(Role.SUPER_ADMIN)) {
            return;
        }
        User admin = new User();
        admin.setUsername(username.trim().toLowerCase());
        admin.setEmail(email.trim().toLowerCase());
        admin.setPassword(encoder.encode(password));
        admin.setRole(Role.SUPER_ADMIN);
        admin.setMustChangePassword(true);
        admin.setTempPasswordExpiry(LocalDateTime.now().plusDays(7));
        userRepo.save(admin);
        log.info("Default super admin created (username: {}, email: {}). It must change its password on first login.",
                admin.getUsername(), admin.getEmail());
    }
}
