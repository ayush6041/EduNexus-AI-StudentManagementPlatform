package com.ayush.SMS.Security;

import com.ayush.SMS.Exception.ApiException;

public final class PasswordPolicy {

    private PasswordPolicy() {
    }

    public static void validate(String password) {
        if (password == null || password.length() < 8) {
            throw ApiException.badRequest("Password must be at least 8 characters long");
        }
        if (password.length() > 72) {
            throw ApiException.badRequest("Password must be at most 72 characters long");
        }
        boolean upper = false;
        boolean lower = false;
        boolean digit = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) upper = true;
            else if (Character.isLowerCase(c)) lower = true;
            else if (Character.isDigit(c)) digit = true;
        }
        if (!(upper && lower && digit)) {
            throw ApiException.badRequest("Password must contain an uppercase letter, a lowercase letter and a digit");
        }
    }
}
