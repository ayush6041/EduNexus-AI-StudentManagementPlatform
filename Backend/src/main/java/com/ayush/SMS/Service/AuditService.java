package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.AuditResponse;
import com.ayush.SMS.DTO.Dtos.PageResponse;
import com.ayush.SMS.Entity.AuditLog;
import com.ayush.SMS.Repository.AuditLogRepo;
import com.ayush.SMS.Security.CurrentUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepo repo;

    public AuditService(AuditLogRepo repo) {
        this.repo = repo;
    }

    public void log(String action, String details) {
        AuditLog entry = new AuditLog();
        entry.setActor(CurrentUser.actor());
        entry.setAction(action);
        entry.setDetails(details != null && details.length() > 1000 ? details.substring(0, 1000) : details);
        repo.save(entry);
    }

    public PageResponse<AuditResponse> list(int page, int size) {
        Page<AuditLog> result = repo.findAllByOrderByCreatedAtDesc(
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        return new PageResponse<>(
                result.getContent().stream()
                        .map(a -> new AuditResponse(a.getId(), a.getActor(), a.getAction(), a.getDetails(), a.getCreatedAt()))
                        .toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }
}
