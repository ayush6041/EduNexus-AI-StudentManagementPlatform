package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Entity.Exam;
import com.ayush.SMS.Entity.Mark;
import com.ayush.SMS.Entity.Student;
import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.ExamRepo;
import com.ayush.SMS.Repository.HolidayRepo;
import com.ayush.SMS.Repository.MarkRepo;
import com.ayush.SMS.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/** Read-only, student-centric views used by both the student portal and the staff overview. */
@Service
public class PortalService {

    private final UserRepo userRepo;
    private final ExamRepo examRepo;
    private final MarkRepo markRepo;
    private final HolidayRepo holidayRepo;
    private final AttendanceService attendanceService;
    private final NoticeService noticeService;
    private final StudentService studentService;

    @Value("${app.admit-card.days-before:14}")
    private int admitCardDays;

    public PortalService(UserRepo userRepo, ExamRepo examRepo, MarkRepo markRepo, HolidayRepo holidayRepo,
                         AttendanceService attendanceService, NoticeService noticeService,
                         StudentService studentService) {
        this.userRepo = userRepo;
        this.examRepo = examRepo;
        this.markRepo = markRepo;
        this.holidayRepo = holidayRepo;
        this.attendanceService = attendanceService;
        this.noticeService = noticeService;
        this.studentService = studentService;
    }

    @Transactional(readOnly = true)
    public StudentResponse profile(Student student) {
        String username = userRepo.findByStudentId(student.getId()).map(User::getUsername).orElse(null);
        return Mappers.student(student, username, attendanceService.summary(student.getId()).percent());
    }

    @Transactional(readOnly = true)
    public StudentSummary summary(Student student) {
        LocalDate today = LocalDate.now();
        List<ExamResponse> upcoming = examRepo
                .findByClassSectionIdAndExamDateGreaterThanEqualOrderByExamDateAscStartTimeAsc(
                        student.getClassSection().getId(), today)
                .stream().limit(4).map(Mappers::exam).toList();
        List<NoticeResponse> notices = noticeService.visibleToClass(student.getClassSection().getId())
                .stream().limit(3).toList();
        HolidayResponse next = holidayRepo.findAllByOrderByHolidayDateAsc().stream()
                .filter(h -> !h.getHolidayDate().isBefore(today))
                .findFirst().map(Mappers::holiday).orElse(null);

        return new StudentSummary(profile(student), attendanceService.summary(student.getId()), upcoming, notices, next);
    }

    @Transactional(readOnly = true)
    public List<MarkResponse> marks(Student student) {
        return markRepo.findByStudentId(student.getId()).stream()
                .sorted(Comparator.comparing((Mark m) -> m.getExam().getExamDate()).reversed())
                .map(m -> new MarkResponse(m.getExam().getId(), m.getExam().getName(), m.getExam().getSubject(),
                        m.getExam().getExamDate(), m.getExam().getMaxMarks(), m.getMarksObtained()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> exams(Student student) {
        return examRepo.findByClassSectionIdOrderByExamDateAscStartTimeAsc(student.getClassSection().getId())
                .stream().map(Mappers::exam).toList();
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> notices(Student student) {
        return noticeService.visibleToClass(student.getClassSection().getId());
    }

    @Transactional(readOnly = true)
    public AdmitCard admitCard(Student student) {
        LocalDate today = LocalDate.now();
        List<Exam> upcoming = examRepo
                .findByClassSectionIdAndExamDateGreaterThanEqualOrderByExamDateAscStartTimeAsc(
                        student.getClassSection().getId(), today);
        if (upcoming.isEmpty()) {
            throw ApiException.notFound("No upcoming exam is scheduled for your class");
        }
        Exam first = upcoming.get(0);
        if (first.getExamDate().isAfter(today.plusDays(admitCardDays))) {
            throw ApiException.notFound("Your admit card becomes available " + admitCardDays + " days before the exam");
        }
        List<ExamResponse> papers = upcoming.stream()
                .filter(e -> e.getName().equalsIgnoreCase(first.getName()))
                .map(Mappers::exam).toList();
        return new AdmitCard(profile(student), first.getName(), papers);
    }

    /** Staff view of one student: profile, attendance, marks. */
    @Transactional(readOnly = true)
    public StudentOverview overview(Long studentId) {
        Student student = studentService.require(studentId);
        List<AttendanceRecordResponse> records = attendanceService.records(studentId);
        return new StudentOverview(profile(student), attendanceService.summary(studentId),
                records.stream().limit(60).toList(), marks(student));
    }
}
