package com.ayush.SMS.Controller;

import com.ayush.SMS.DTO.Dtos.AttendanceRosterRow;
import com.ayush.SMS.DTO.Dtos.AttendanceSaveRequest;
import com.ayush.SMS.DTO.Dtos.MessageResponse;
import com.ayush.SMS.Service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping("/class/{classId}")
    public List<AttendanceRosterRow> roster(@PathVariable Long classId,
                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.roster(classId, date);
    }

    @PostMapping("/class/{classId}")
    public MessageResponse save(@PathVariable Long classId, @Valid @RequestBody AttendanceSaveRequest request) {
        return service.save(classId, request);
    }
}
