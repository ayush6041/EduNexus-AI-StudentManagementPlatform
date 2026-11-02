package com.ayush.SMS.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    @Async
    public void sendCredentials(String to, String name, String username, String admissionNo,
                                String tempPassword, long validHours) {
        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(name).append(",\n\n")
                .append("An account has been created for you on the Student Management System.\n\n")
                .append("Username: ").append(username).append('\n');
        if (admissionNo != null) {
            body.append("Admission number: ").append(admissionNo).append('\n');
        }
        body.append("Temporary password: ").append(tempPassword).append("\n\n")
                .append("Sign in at ").append(frontendUrl).append(" - you will be asked to choose a new password ")
                .append("immediately. This temporary password expires in ").append(validHours).append(" hours.\n");
        send(to, "Your Student Management System login", body.toString(),
                "login credentials for " + username + " (temporary password: " + tempPassword + ")");
    }

    @Async
    public void sendOtp(String to, String otp, long validMinutes) {
        String body = "Your password reset code is: " + otp + "\n\nIt is valid for " + validMinutes
                + " minutes. If you did not request this, you can safely ignore this email.";
        send(to, "Student Management System - password reset code", body, "password reset code: " + otp);
    }

    private void send(String to, String subject, String body, String devLogLine) {
        JavaMailSender sender = mailEnabled ? mailSenderProvider.getIfAvailable() : null;

        if (sender == null) {
            log.warn("[DEV MODE - email not sent] To: {} | {}", to, devLogLine);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.isBlank()) {
                message.setFrom(fromAddress);
            }
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
