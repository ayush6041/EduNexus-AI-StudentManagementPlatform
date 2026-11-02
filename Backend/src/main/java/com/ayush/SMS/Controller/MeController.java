package com.ayush.SMS.Controller;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Security.CurrentUser;
import com.ayush.SMS.Service.AttendanceService;
import com.ayush.SMS.Service.HolidayService;
import com.ayush.SMS.Service.PortalService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Everything a student can see. All data is resolved from the logged-in account -
 * no student id is ever accepted from the client, so students cannot read each other's data.
 * These endpoints are read-only; students cannot edit anything.
 */
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final PortalService portal;
    private final AttendanceService attendance;
    private final HolidayService holidays;

    public MeController(PortalService portal, AttendanceService attendance, HolidayService holidays) {
        this.portal = portal;
        this.attendance = attendance;
        this.holidays = holidays;
    }

    @GetMapping("/profile")
    public StudentResponse profile() {
        return portal.profile(CurrentUser.student());
    }

    @GetMapping("/summary")
    public StudentSummary summary() {
        return portal.summary(CurrentUser.student());
    }

    @GetMapping("/attendance")
    public List<AttendanceRecordResponse> attendance() {
        return attendance.records(CurrentUser.student().getId());
    }

    @GetMapping("/attendance/summary")
    public AttendanceSummary attendanceSummary() {
        return attendance.summary(CurrentUser.student().getId());
    }

    @GetMapping("/marks")
    public List<MarkResponse> marks() {
        return portal.marks(CurrentUser.student());
    }

    @GetMapping("/exams")
    public List<ExamResponse> exams() {
        return portal.exams(CurrentUser.student());
    }

    @GetMapping("/admit-card")
    public AdmitCard admitCard() {
        return portal.admitCard(CurrentUser.student());
    }

    @GetMapping("/notices")
    public List<NoticeResponse> notices() {
        return portal.notices(CurrentUser.student());
    }

    @GetMapping("/holidays")
    public List<HolidayResponse> holidays() {
        return holidays.list();
    }
}
