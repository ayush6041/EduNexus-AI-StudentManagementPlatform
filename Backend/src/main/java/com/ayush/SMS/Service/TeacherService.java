package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.MessageResponse;
import com.ayush.SMS.DTO.Dtos.TeacherRequest;
import com.ayush.SMS.DTO.Dtos.TeacherResponse;
import com.ayush.SMS.Entity.Teacher;
import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.TeacherRepo;
import com.ayush.SMS.Repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepo teacherRepo;
    private final UserRepo userRepo;
    private final UserAccountService accounts;
    private final AuditService audit;

    public TeacherService(TeacherRepo teacherRepo, UserRepo userRepo, UserAccountService accounts, AuditService audit) {
        this.teacherRepo = teacherRepo;
        this.userRepo = userRepo;
        this.accounts = accounts;
        this.audit = audit;
    }

    private Teacher require(Long id) {
        return teacherRepo.findById(id).orElseThrow(() -> ApiException.notFound("Teacher not found"));
    }

    @Transactional(readOnly = true)
    public List<TeacherResponse> list() {
        return teacherRepo.findAllByOrderByNameAsc().stream()
                .map(t -> toResponse(t, userRepo.findByTeacherId(t.getId()).map(User::getUsername).orElse(null)))
                .toList();
    }

    @Transactional
    public TeacherResponse create(TeacherRequest request) {
        String email = request.email().trim().toLowerCase();
        if (teacherRepo.existsByEmailIgnoreCase(email) || userRepo.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("This email address is already in use");
        }
        Teacher teacher = new Teacher();
        teacher.setName(request.name().trim());
        teacher.setEmail(email);
        teacher.setMobileNumber(Mappers.clean(request.mobileNumber()));
        teacher.setDepartment(Mappers.clean(request.department()));
        teacher = teacherRepo.save(teacher);

        User user = accounts.createTeacherAccount(teacher);
        audit.log("TEACHER_CREATED", teacher.getName() + " <" + email + ">");
        return toResponse(teacher, user.getUsername());
    }

    @Transactional
    public TeacherResponse update(Long id, TeacherRequest request) {
        Teacher teacher = require(id);
        String email = request.email().trim().toLowerCase();
        User user = userRepo.findByTeacherId(id).orElse(null);

        if (!email.equalsIgnoreCase(teacher.getEmail())
                && (teacherRepo.existsByEmailIgnoreCase(email) || userRepo.existsByEmailIgnoreCase(email))) {
            throw ApiException.conflict("This email address is already in use");
        }
        teacher.setName(request.name().trim());
        teacher.setEmail(email);
        teacher.setMobileNumber(Mappers.clean(request.mobileNumber()));
        teacher.setDepartment(Mappers.clean(request.department()));
        teacherRepo.save(teacher);

        if (user != null && !email.equalsIgnoreCase(user.getEmail())) {
            user.setEmail(email);
            userRepo.save(user);
        }
        audit.log("TEACHER_UPDATED", teacher.getName());
        return toResponse(teacher, user == null ? null : user.getUsername());
    }

    @Transactional
    public void delete(Long id) {
        Teacher teacher = require(id);
        userRepo.findByTeacherId(id).ifPresent(userRepo::delete);
        teacherRepo.delete(teacher);
        audit.log("TEACHER_DELETED", teacher.getName() + " <" + teacher.getEmail() + ">");
    }

    @Transactional
    public MessageResponse resendCredentials(Long id) {
        Teacher teacher = require(id);
        User user = userRepo.findByTeacherId(id)
                .orElseThrow(() -> ApiException.notFound("This teacher has no login account"));
        accounts.resendCredentials(user, teacher.getName(), null);
        audit.log("CREDENTIALS_RESENT", teacher.getName());
        return new MessageResponse("A new temporary password has been emailed to " + teacher.getEmail());
    }

    private TeacherResponse toResponse(Teacher t, String username) {
        return new TeacherResponse(t.getId(), t.getName(), t.getEmail(), t.getMobileNumber(), t.getDepartment(), username);
    }
}
