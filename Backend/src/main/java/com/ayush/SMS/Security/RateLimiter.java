package com.ayush.SMS.Security;

import com.ayush.SMS.Exception.ApiException;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/** Small in-memory sliding-window limiter (per application instance). */
@Component
public class RateLimiter {

    private final ConcurrentHashMap<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public void check(String key, int maxRequests, long windowMillis) {
        long now = System.currentTimeMillis();

        if (hits.size() > 10_000) {
            hits.entrySet().removeIf(e -> {
                synchronized (e.getValue()) {
                    Long last = e.getValue().peekLast();
                    return last == null || now - last > windowMillis;
                }
            });
        }

        Deque<Long> deque = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && now - deque.peekFirst() > windowMillis) {
                deque.pollFirst();
            }
            if (deque.size() >= maxRequests) {
                throw ApiException.tooMany("Too many attempts. Please wait a few minutes and try again.");
            }
            deque.addLast(now);
        }
    }
}
