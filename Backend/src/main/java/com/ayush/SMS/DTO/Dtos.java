package com.ayush.SMS.DTO;

import com.ayush.SMS.Entity.AttendanceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/** All request / response shapes of the API. Entities are never returned directly. */
public final class Dtos {

    private Dtos() {
    }

    // ------------------------------------------------------------ common
    public record ErrorResponse(String message, String code) {
    }

    public record MessageResponse(String message) {
    }

    public record PageResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages) {
    }

    // -------------------------------------------------------------- auth
    public record LoginRequest(@NotBlank @Size(max = 150) String identifier,
                               @NotBlank @Size(max = 200) String password) {
    }

    public record AuthResponse(String token, String username, String email, String name,
                               String role, boolean mustChangePassword) {
    }

    public record ChangePasswordRequest(@NotBlank @Size(max = 200) String currentPassword,
                                        @NotBlank @Size(max = 200) String newPassword) {
    }

    public record ForgotPasswordRequest(@NotBlank @Email @Size(max = 150) String email) {
    }

    public record ResetPasswordRequest(@NotBlank @Email @Size(max = 150) String email,
                                       @NotBlank @Size(max = 10) String otp,
                                       @NotBlank @Size(max = 200) String newPassword) {
    }

    // ----------------------------------------------------------- classes
    public record ClassRequest(@NotBlank @Size(max = 20) String name,
                               @NotBlank @Size(max = 10) String section) {
    }

    public record ClassResponse(Long id, String name, String section, String displayName, long studentCount) {
    }

    // ---------------------------------------------------------- students
    public record StudentRequest(@NotBlank @Size(max = 120) String name,
                                 @NotBlank @Email @Size(max = 150) String email,
                                 @NotBlank @Size(max = 40) String admissionNo,
                                 @Size(max = 20) String mobileNumber,
                                 @NotNull Long classId) {
    }

    public record StudentResponse(Long id, String admissionNo, String name, String email, String mobileNumber,
                                  Long classId, String className, String username, Double attendancePercent) {
    }

    public record StudentOverview(StudentResponse profile, AttendanceSummary attendance,
                                  List<AttendanceRecordResponse> recentAttendance, List<MarkResponse> marks) {
    }

    // ---------------------------------------------------------- teachers
    public record TeacherRequest(@NotBlank @Size(max = 120) String name,
                                 @NotBlank @Email @Size(max = 150) String email,
                                 @Size(max = 20) String mobileNumber,
                                 @Size(max = 100) String department) {
    }

    public record TeacherResponse(Long id, String name, String email, String mobileNumber,
                                  String department, String username) {
    }

    // ------------------------------------------------------------- exams
    public record ExamRequest(@NotBlank @Size(max = 120) String name,
                              @NotBlank @Size(max = 100) String subject,
                              @NotNull Long classId,
                              @NotNull LocalDate examDate,
                              @NotNull LocalTime startTime,
                              @NotNull LocalTime endTime,
                              @Size(max = 60) String room,
                              @NotNull @Min(1) Integer maxMarks) {
    }

    public record ExamResponse(Long id, String name, String subject, Long classId, String className,
                               LocalDate examDate, LocalTime startTime, LocalTime endTime,
                               String room, int maxMarks) {
    }

    public record AdmitCard(StudentResponse student, String examName, List<ExamResponse> papers) {
    }

    // -------------------------------------------------------- attendance
    public record AttendanceEntry(@NotNull Long studentId, @NotNull AttendanceStatus status) {
    }

    public record AttendanceSaveRequest(@NotNull LocalDate date,
                                        @NotEmpty @Valid List<AttendanceEntry> records) {
    }

    public record AttendanceRosterRow(Long studentId, String name, String admissionNo, AttendanceStatus status) {
    }

    public record AttendanceRecordResponse(LocalDate date, AttendanceStatus status) {
    }

    public record AttendanceSummary(long total, long attended, long absent, double percent) {
    }

    // ------------------------------------------------------------- marks
    public record MarkEntry(@NotNull Long studentId, Double marks) {
    }

    public record MarkSaveRequest(@NotEmpty @Valid List<MarkEntry> entries) {
    }

    public record MarkRosterRow(Long studentId, String name, String admissionNo, Double marks) {
    }

    public record MarkResponse(Long examId, String examName, String subject, LocalDate examDate,
                               int maxMarks, double marks) {
    }

    // ----------------------------------------------- notices / holidays
    public record NoticeRequest(@NotBlank @Size(max = 200) String title,
                                @NotBlank @Size(max = 4000) String body,
                                Long classId) {
    }

    public record NoticeResponse(Long id, String title, String body, Long classId, String className,
                                 String createdBy, LocalDateTime createdAt) {
    }

    public record HolidayRequest(@NotBlank @Size(max = 150) String name,
                                 @NotNull LocalDate date,
                                 @Size(max = 500) String description) {
    }

    public record HolidayResponse(Long id, String name, LocalDate date, String description) {
    }

    // ------------------------------------------------- dashboards / audit
    public record TrendPoint(LocalDate date, Double percent) {
    }

    public record StatsResponse(long students, long teachers, long classes, long upcomingExams,
                                Double todayAttendancePercent, List<TrendPoint> attendanceTrend,
                                List<ClassResponse> classBreakdown) {
    }

    public record StudentSummary(StudentResponse profile, AttendanceSummary attendance,
                                 List<ExamResponse> upcomingExams, List<NoticeResponse> latestNotices,
                                 HolidayResponse nextHoliday) {
    }

    public record AuditResponse(Long id, String actor, String action, String details, LocalDateTime createdAt) {
    }
}
