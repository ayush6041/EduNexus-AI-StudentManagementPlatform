package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Entity.ClassSection;
import com.ayush.SMS.Entity.Student;
import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.AttendanceRepo;
import com.ayush.SMS.Repository.MarkRepo;
import com.ayush.SMS.Repository.StudentRepo;
import com.ayush.SMS.Repository.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class StudentService {

    private final StudentRepo studentRepo;
    private final UserRepo userRepo;
    private final AttendanceRepo attendanceRepo;
    private final MarkRepo markRepo;
    private final ClassService classService;
    private final UserAccountService accounts;
    private final AttendanceService attendanceService;
    private final AuditService audit;

    public StudentService(StudentRepo studentRepo, UserRepo userRepo, AttendanceRepo attendanceRepo,
                          MarkRepo markRepo, ClassService classService, UserAccountService accounts,
                          AttendanceService attendanceService, AuditService audit) {
        this.studentRepo = studentRepo;
        this.userRepo = userRepo;
        this.attendanceRepo = attendanceRepo;
        this.markRepo = markRepo;
        this.classService = classService;
        this.accounts = accounts;
        this.attendanceService = attendanceService;
        this.audit = audit;
    }

    public Student require(Long id) {
        return studentRepo.findById(id).orElseThrow(() -> ApiException.notFound("Student not found"));
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        String email = request.email().trim().toLowerCase();
        String admissionNo = request.admissionNo().trim();

        if (studentRepo.existsByAdmissionNoIgnoreCase(admissionNo)) {
            throw ApiException.conflict("A student with this admission number already exists");
        }
        if (studentRepo.existsByEmailIgnoreCase(email) || userRepo.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("This email address is already in use");
        }
        ClassSection classSection = classService.require(request.classId());

        Student student = new Student();
        student.setName(request.name().trim());
        student.setEmail(email);
        student.setAdmissionNo(admissionNo);
        student.setMobileNumber(Mappers.clean(request.mobileNumber()));
        student.setClassSection(classSection);
        student = studentRepo.save(student);

        User user = accounts.createStudentAccount(student);
        audit.log("STUDENT_CREATED", student.getName() + " (" + admissionNo + ") in " + classSection.displayName());
        return Mappers.student(student, user.getUsername(), null);
    }

    @Transactional
    public StudentResponse update(Long id, StudentRequest request) {
        Student student = require(id);
        String email = request.email().trim().toLowerCase();
        User user = userRepo.findByStudentId(id).orElse(null);

        if (!email.equalsIgnoreCase(student.getEmail())
                && (studentRepo.existsByEmailIgnoreCase(email) || userRepo.existsByEmailIgnoreCase(email))) {
            throw ApiException.conflict("This email address is already in use");
        }
        if (!request.admissionNo().trim().equalsIgnoreCase(student.getAdmissionNo())) {
            throw ApiException.badRequest("The admission number cannot be changed");
        }

        student.setName(request.name().trim());
        student.setEmail(email);
        student.setMobileNumber(Mappers.clean(request.mobileNumber()));
        student.setClassSection(classService.require(request.classId()));
        studentRepo.save(student);

        if (user != null && !email.equalsIgnoreCase(user.getEmail())) {
            user.setEmail(email);
            userRepo.save(user);
        }
        audit.log("STUDENT_UPDATED", student.getName() + " (" + student.getAdmissionNo() + ")");
        return Mappers.student(student, user == null ? null : user.getUsername(), null);
    }

    @Transactional
    public void delete(Long id) {
        Student student = require(id);
        userRepo.findByStudentId(id).ifPresent(userRepo::delete);
        markRepo.deleteByStudentId(id);
        attendanceRepo.deleteByStudentId(id);
        studentRepo.delete(student);
        audit.log("STUDENT_DELETED", student.getName() + " (" + student.getAdmissionNo() + ")");
    }

    @Transactional(readOnly = true)
    public StudentResponse get(Long id) {
        Student student = require(id);
        String username = userRepo.findByStudentId(id).map(User::getUsername).orElse(null);
        return Mappers.student(student, username, attendanceService.summary(id).percent());
    }

    @Transactional
    public MessageResponse resendCredentials(Long id) {
        Student student = require(id);
        User user = userRepo.findByStudentId(id)
                .orElseThrow(() -> ApiException.notFound("This student has no login account"));
        accounts.resendCredentials(user, student.getName(), student.getAdmissionNo());
        audit.log("CREDENTIALS_RESENT", student.getName() + " (" + student.getAdmissionNo() + ")");
        return new MessageResponse("A new temporary password has been emailed to " + student.getEmail());
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentResponse> search(String q, Long classId, Double minAttendance,
                                                Double maxAttendance, int page, int size) {
        Page<Student> result = query(q, classId, minAttendance, maxAttendance,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("name").ascending()));
        return new PageResponse<>(toResponses(result.getContent()), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public String exportCsv(String q, Long classId, Double minAttendance, Double maxAttendance) {
        Page<Student> result = query(q, classId, minAttendance, maxAttendance,
                PageRequest.of(0, 5000, Sort.by("name").ascending()));
        StringBuilder csv = new StringBuilder("Admission No,Name,Email,Mobile,Class,Attendance %\n");
        for (StudentResponse s : toResponses(result.getContent())) {
            csv.append(cell(s.admissionNo())).append(',')
                    .append(cell(s.name())).append(',')
                    .append(cell(s.email())).append(',')
                    .append(cell(s.mobileNumber())).append(',')
                    .append(cell(s.className())).append(',')
                    .append(s.attendancePercent() == null ? "" : s.attendancePercent())
                    .append('\n');
        }
        return csv.toString();
    }

    private Page<Student> query(String q, Long classId, Double min, Double max, PageRequest pageable) {
        String like = (q == null || q.isBlank()) ? null : "%" + q.trim().toLowerCase() + "%";
        boolean useAttendance = min != null || max != null;
        double lo = min == null ? 0.0 : min;
        double hi = max == null ? 100.0 : max;
        return studentRepo.search(like, classId, useAttendance, lo, hi, pageable);
    }

    private List<StudentResponse> toResponses(List<Student> students) {
        Map<Long, Double> percents = attendanceService.percentages(students.stream().map(Student::getId).toList());
        return students.stream()
                .map(s -> Mappers.student(s, null, percents.get(s.getId())))
                .toList();
    }

    /** Quotes a CSV cell and neutralises spreadsheet formula injection. */
    private static String cell(String value) {
        if (value == null) {
            return "";
        }
        String v = value;
        if (!v.isEmpty() && "=+-@\t\r".indexOf(v.charAt(0)) >= 0) {
            v = "'" + v;
        }
        return "\"" + v.replace("\"", "\"\"") + "\"";
    }
}
