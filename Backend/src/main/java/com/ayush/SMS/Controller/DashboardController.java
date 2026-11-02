package com.ayush.SMS.Controller;

import com.ayush.SMS.DTO.Dtos.AuditResponse;
import com.ayush.SMS.DTO.Dtos.PageResponse;
import com.ayush.SMS.DTO.Dtos.StatsResponse;
import com.ayush.SMS.Service.AuditService;
import com.ayush.SMS.Service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final StatsService stats;
    private final AuditService audit;

    public DashboardController(StatsService stats, AuditService audit) {
        this.stats = stats;
        this.audit = audit;
    }

    @GetMapping("/dashboard/stats")
    public StatsResponse stats() {
        return stats.stats();
    }

    /** Restricted to SUPER_ADMIN by SecurityConfig. */
    @GetMapping("/audit")
    public PageResponse<AuditResponse> audit(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return audit.list(page, size);
    }
}
