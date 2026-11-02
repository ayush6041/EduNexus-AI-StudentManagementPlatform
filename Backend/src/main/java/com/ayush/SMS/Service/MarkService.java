package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Entity.Exam;
import com.ayush.SMS.Entity.Mark;
import com.ayush.SMS.Entity.Student;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.MarkRepo;
import com.ayush.SMS.Repository.StudentRepo;
import com.ayush.SMS.Security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MarkService {

    private final MarkRepo markRepo;
    private final StudentRepo studentRepo;
    private final ExamService examService;
    private final AuditService audit;

    public MarkService(MarkRepo markRepo, StudentRepo studentRepo, ExamService examService, AuditService audit) {
        this.markRepo = markRepo;
        this.studentRepo = studentRepo;
        this.examService = examService;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<MarkRosterRow> roster(Long examId) {
        Exam exam = examService.require(examId);
        Map<Long, Double> marks = markRepo.findByExamId(examId).stream()
                .collect(Collectors.toMap(m -> m.getStudent().getId(), Mark::getMarksObtained));

        return studentRepo.findByClassSectionIdOrderByNameAsc(exam.getClassSection().getId()).stream()
                .map(s -> new MarkRosterRow(s.getId(), s.getName(), s.getAdmissionNo(), marks.get(s.getId())))
                .toList();
    }

    @Transactional
    public MessageResponse save(Long examId, MarkSaveRequest request) {
        Exam exam = examService.require(examId);
        Map<Long, Student> students = studentRepo.findByClassSectionIdOrderByNameAsc(exam.getClassSection().getId())
                .stream().collect(Collectors.toMap(Student::getId, Function.identity()));
        Map<Long, Mark> existing = markRepo.findByExamId(examId).stream()
                .collect(Collectors.toMap(m -> m.getStudent().getId(), Function.identity()));

        String actor = CurrentUser.actor();
        int changed = 0;
        for (MarkEntry entry : request.entries()) {
            Student student = students.get(entry.studentId());
            if (student == null) {
                throw ApiException.badRequest("Student " + entry.studentId() + " is not in this exam's class");
            }
            Mark mark = existing.get(student.getId());

            if (entry.marks() == null) {
                if (mark != null) {
                    markRepo.delete(mark);
                    changed++;
                }
                continue;
            }
            double value = entry.marks();
            if (Double.isNaN(value) || value < 0 || value > exam.getMaxMarks()) {
                throw ApiException.badRequest("Marks for " + student.getName() + " must be between 0 and " + exam.getMaxMarks());
            }
            if (mark == null) {
                mark = new Mark();
                mark.setStudent(student);
                mark.setExam(exam);
            } else if (mark.getMarksObtained() == value) {
                continue;
            }
            mark.setMarksObtained(value);
            mark.setUpdatedBy(actor);
            mark.setUpdatedAt(LocalDateTime.now());
            markRepo.save(mark);
            changed++;
        }
        audit.log("MARKS_UPDATED", exam.getName() + " / " + exam.getSubject() + " / "
                + exam.getClassSection().displayName() + " (" + changed + " changes)");
        return new MessageResponse("Marks saved (" + changed + " changes)");
    }
}
