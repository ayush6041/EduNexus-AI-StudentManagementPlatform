package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Entity.*;

final class Mappers {

    private Mappers() {
    }

    static ClassResponse clazz(ClassSection c, long studentCount) {
        return new ClassResponse(c.getId(), c.getName(), c.getSection(), c.displayName(), studentCount);
    }

    static StudentResponse student(Student s, String username, Double attendancePercent) {
        return new StudentResponse(s.getId(), s.getAdmissionNo(), s.getName(), s.getEmail(), s.getMobileNumber(),
                s.getClassSection().getId(), s.getClassSection().displayName(), username, attendancePercent);
    }

    static ExamResponse exam(Exam e) {
        return new ExamResponse(e.getId(), e.getName(), e.getSubject(), e.getClassSection().getId(),
                e.getClassSection().displayName(), e.getExamDate(), e.getStartTime(), e.getEndTime(),
                e.getRoom(), e.getMaxMarks());
    }

    static NoticeResponse notice(Notice n) {
        ClassSection c = n.getClassSection();
        return new NoticeResponse(n.getId(), n.getTitle(), n.getBody(),
                c == null ? null : c.getId(), c == null ? "All classes" : c.displayName(),
                n.getCreatedBy(), n.getCreatedAt());
    }

    static HolidayResponse holiday(Holiday h) {
        return new HolidayResponse(h.getId(), h.getName(), h.getHolidayDate(), h.getDescription());
    }

    static String clean(String value) {
        return value == null ? null : value.trim();
    }
}
