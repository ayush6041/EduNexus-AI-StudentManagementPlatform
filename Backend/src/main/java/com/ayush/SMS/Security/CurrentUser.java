package com.ayush.SMS.Security;

import com.ayush.SMS.Entity.Student;
import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Exception.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static User get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw ApiException.unauthorized("Authentication required");
        }
        return user;
    }

    public static String actor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user.getEmail();
        }
        return "system";
    }

    /** The student profile linked to the logged-in account (students only). */
    public static Student student() {
        Student student = get().getStudent();
        if (student == null) {
            throw ApiException.forbidden("No student profile is linked to this account");
        }
        return student;
    }
}
