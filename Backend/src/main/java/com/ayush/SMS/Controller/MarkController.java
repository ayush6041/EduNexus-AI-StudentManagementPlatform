package com.ayush.SMS.Controller;

import com.ayush.SMS.DTO.Dtos.MarkRosterRow;
import com.ayush.SMS.DTO.Dtos.MarkSaveRequest;
import com.ayush.SMS.DTO.Dtos.MessageResponse;
import com.ayush.SMS.Service.MarkService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    private final MarkService service;

    public MarkController(MarkService service) {
        this.service = service;
    }

    @GetMapping("/exam/{examId}")
    public List<MarkRosterRow> roster(@PathVariable Long examId) {
        return service.roster(examId);
    }

    @PostMapping("/exam/{examId}")
    public MessageResponse save(@PathVariable Long examId, @Valid @RequestBody MarkSaveRequest request) {
        return service.save(examId, request);
    }
}
