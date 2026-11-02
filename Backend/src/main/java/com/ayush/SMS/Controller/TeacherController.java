package com.ayush.SMS.Controller;

import com.ayush.SMS.DTO.Dtos.MessageResponse;
import com.ayush.SMS.DTO.Dtos.TeacherRequest;
import com.ayush.SMS.DTO.Dtos.TeacherResponse;
import com.ayush.SMS.Service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class TeacherController {

    private final TeacherService service;

    public TeacherController(TeacherService service) {
        this.service = service;
    }

    @GetMapping
    public List<TeacherResponse> list() {
        return service.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherResponse create(@Valid @RequestBody TeacherRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TeacherResponse update(@PathVariable Long id, @Valid @RequestBody TeacherRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/resend-credentials")
    public MessageResponse resend(@PathVariable Long id) {
        return service.resendCredentials(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
