package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.ExamRequest;
import com.ayush.SMS.DTO.Dtos.ExamResponse;
import com.ayush.SMS.Entity.Exam;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.ExamRepo;
import com.ayush.SMS.Repository.MarkRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepo examRepo;
    private final MarkRepo markRepo;
    private final ClassService classService;
    private final AuditService audit;

    public ExamService(ExamRepo examRepo, MarkRepo markRepo, ClassService classService, AuditService audit) {
        this.examRepo = examRepo;
        this.markRepo = markRepo;
        this.classService = classService;
        this.audit = audit;
    }

    public Exam require(Long id) {
        return examRepo.findById(id).orElseThrow(() -> ApiException.notFound("Exam not found"));
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> list(Long classId) {
        List<Exam> exams = classId == null
                ? examRepo.findAllByOrderByExamDateAscStartTimeAsc()
                : examRepo.findByClassSectionIdOrderByExamDateAscStartTimeAsc(classId);
        return exams.stream().map(Mappers::exam).toList();
    }

    @Transactional
    public ExamResponse create(ExamRequest request) {
        Exam exam = new Exam();
        apply(exam, request);
        exam = examRepo.save(exam);
        audit.log("EXAM_CREATED", exam.getName() + " / " + exam.getSubject() + " / " + exam.getClassSection().displayName());
        return Mappers.exam(exam);
    }

    @Transactional
    public ExamResponse update(Long id, ExamRequest request) {
        Exam exam = require(id);
        apply(exam, request);
        exam = examRepo.save(exam);
        audit.log("EXAM_UPDATED", exam.getName() + " / " + exam.getSubject());
        return Mappers.exam(exam);
    }

    @Transactional
    public void delete(Long id) {
        Exam exam = require(id);
        markRepo.deleteByExamId(id);
        examRepo.delete(exam);
        audit.log("EXAM_DELETED", exam.getName() + " / " + exam.getSubject());
    }

    private void apply(Exam exam, ExamRequest r) {
        if (!r.endTime().isAfter(r.startTime())) {
            throw ApiException.badRequest("End time must be after start time");
        }
        exam.setName(r.name().trim());
        exam.setSubject(r.subject().trim());
        exam.setClassSection(classService.require(r.classId()));
        exam.setExamDate(r.examDate());
        exam.setStartTime(r.startTime());
        exam.setEndTime(r.endTime());
        exam.setRoom(Mappers.clean(r.room()));
        exam.setMaxMarks(r.maxMarks());
    }
}
