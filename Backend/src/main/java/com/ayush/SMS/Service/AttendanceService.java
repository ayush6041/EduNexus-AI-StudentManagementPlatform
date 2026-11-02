package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Entity.Attendance;
import com.ayush.SMS.Entity.AttendanceStatus;
import com.ayush.SMS.Entity.Student;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.AttendanceRepo;
import com.ayush.SMS.Repository.StudentRepo;
import com.ayush.SMS.Security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepo attendanceRepo;
    private final StudentRepo studentRepo;
    private final ClassService classService;
    private final AuditService audit;

    public AttendanceService(AttendanceRepo attendanceRepo, StudentRepo studentRepo,
                             ClassService classService, AuditService audit) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo = studentRepo;
        this.classService = classService;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRosterRow> roster(Long classId, LocalDate date) {
        classService.require(classId);
        Map<Long, AttendanceStatus> existing = attendanceRepo
                .findByStudent_ClassSection_IdAndAttendanceDate(classId, date).stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), Attendance::getStatus));

        return studentRepo.findByClassSectionIdOrderByNameAsc(classId).stream()
                .map(s -> new AttendanceRosterRow(s.getId(), s.getName(), s.getAdmissionNo(), existing.get(s.getId())))
                .toList();
    }

    @Transactional
    public MessageResponse save(Long classId, AttendanceSaveRequest request) {
        classService.require(classId);
        if (request.date().isAfter(LocalDate.now())) {
            throw ApiException.badRequest("Attendance cannot be marked for a future date");
        }

        Map<Long, Student> classStudents = studentRepo.findByClassSectionIdOrderByNameAsc(classId).stream()
                .collect(Collectors.toMap(Student::getId, Function.identity()));
        Map<Long, Attendance> existing = attendanceRepo
                .findByStudent_ClassSection_IdAndAttendanceDate(classId, request.date()).stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), Function.identity()));

        String actor = CurrentUser.actor();
        int saved = 0;
        for (AttendanceEntry entry : request.records()) {
            Student student = classStudents.get(entry.studentId());
            if (student == null) {
                throw ApiException.badRequest("Student " + entry.studentId() + " does not belong to this class");
            }
            Attendance record = existing.get(student.getId());
            if (record == null) {
                record = new Attendance();
                record.setStudent(student);
                record.setAttendanceDate(request.date());
            }
            record.setStatus(entry.status());
            record.setMarkedBy(actor);
            attendanceRepo.save(record);
            saved++;
        }
        audit.log("ATTENDANCE_MARKED", "class " + classId + " on " + request.date() + " (" + saved + " students)");
        return new MessageResponse("Attendance saved for " + saved + " students");
    }

    @Transactional(readOnly = true)
    public AttendanceSummary summary(Long studentId) {
        List<Object[]> rows = attendanceRepo.summarize(List.of(studentId));
        if (rows.isEmpty()) {
            return new AttendanceSummary(0, 0, 0, 0.0);
        }
        long attended = ((Number) rows.get(0)[1]).longValue();
        long total = ((Number) rows.get(0)[2]).longValue();
        return new AttendanceSummary(total, attended, total - attended, percent(attended, total));
    }

    @Transactional(readOnly = true)
    public Map<Long, Double> percentages(Collection<Long> studentIds) {
        Map<Long, Double> result = new HashMap<>();
        if (studentIds.isEmpty()) {
            return result;
        }
        for (Object[] row : attendanceRepo.summarize(studentIds)) {
            result.put(((Number) row[0]).longValue(),
                    percent(((Number) row[1]).longValue(), ((Number) row[2]).longValue()));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> records(Long studentId) {
        return attendanceRepo.findByStudentIdOrderByAttendanceDateDesc(studentId).stream()
                .map(a -> new AttendanceRecordResponse(a.getAttendanceDate(), a.getStatus()))
                .toList();
    }

    static double percent(long attended, long total) {
        if (total == 0) {
            return 0.0;
        }
        return Math.round(attended * 1000.0 / total) / 10.0;
    }
}
