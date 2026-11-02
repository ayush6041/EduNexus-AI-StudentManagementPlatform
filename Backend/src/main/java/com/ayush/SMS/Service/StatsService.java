package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.StatsResponse;
import com.ayush.SMS.DTO.Dtos.TrendPoint;
import com.ayush.SMS.Entity.AttendanceStatus;
import com.ayush.SMS.Repository.AttendanceRepo;
import com.ayush.SMS.Repository.ExamRepo;
import com.ayush.SMS.Repository.StudentRepo;
import com.ayush.SMS.Repository.TeacherRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatsService {

    private final StudentRepo studentRepo;
    private final TeacherRepo teacherRepo;
    private final ExamRepo examRepo;
    private final AttendanceRepo attendanceRepo;
    private final ClassService classService;

    public StatsService(StudentRepo studentRepo, TeacherRepo teacherRepo, ExamRepo examRepo,
                        AttendanceRepo attendanceRepo, ClassService classService) {
        this.studentRepo = studentRepo;
        this.teacherRepo = teacherRepo;
        this.examRepo = examRepo;
        this.attendanceRepo = attendanceRepo;
        this.classService = classService;
    }

    @Transactional(readOnly = true)
    public StatsResponse stats() {
        LocalDate today = LocalDate.now();
        List<TrendPoint> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            trend.add(new TrendPoint(day, dayPercent(day)));
        }
        var classes = classService.list();
        return new StatsResponse(studentRepo.count(), teacherRepo.count(), classes.size(),
                examRepo.countByExamDateGreaterThanEqual(today), dayPercent(today), trend, classes);
    }

    private Double dayPercent(LocalDate day) {
        long total = attendanceRepo.countByAttendanceDate(day);
        if (total == 0) {
            return null;
        }
        long attended = attendanceRepo.countByAttendanceDateAndStatusNot(day, AttendanceStatus.ABSENT);
        return AttendanceService.percent(attended, total);
    }
}
