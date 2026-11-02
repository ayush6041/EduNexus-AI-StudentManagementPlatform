package com.ayush.SMS.Security;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Writes the JSON error shape used by the API from inside servlet filters. */
public final class ErrorWriter {

    private ErrorWriter() {
    }

    public static void write(HttpServletResponse response, int status, String code, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String body = "{\"message\":\"" + escape(message) + "\",\"code\":\"" + escape(code) + "\"}";
        response.getWriter().write(body);
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
