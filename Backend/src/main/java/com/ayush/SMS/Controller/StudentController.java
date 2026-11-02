package com.ayush.SMS.Controller;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Service.PortalService;
import com.ayush.SMS.Service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;
    private final PortalService portal;

    public StudentController(StudentService service, PortalService portal) {
        this.service = service;
        this.portal = portal;
    }

    @GetMapping
    public PageResponse<StudentResponse> search(@RequestParam(required = false) String q,
                                                @RequestParam(required = false) Long classId,
                                                @RequestParam(required = false) Double minAttendance,
                                                @RequestParam(required = false) Double maxAttendance,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        return service.search(q, classId, minAttendance, maxAttendance, page, size);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String q,
                                         @RequestParam(required = false) Long classId,
                                         @RequestParam(required = false) Double minAttendance,
                                         @RequestParam(required = false) Double maxAttendance) {
        String csv = service.exportCsv(q, classId, minAttendance, maxAttendance);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/{id}/overview")
    public StudentOverview overview(@PathVariable Long id) {
        return portal.overview(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse create(@Valid @RequestBody StudentRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/resend-credentials")
    public MessageResponse resend(@PathVariable Long id) {
        return service.resendCredentials(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
