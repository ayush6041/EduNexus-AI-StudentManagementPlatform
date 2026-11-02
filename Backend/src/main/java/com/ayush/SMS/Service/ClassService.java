package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.ClassRequest;
import com.ayush.SMS.DTO.Dtos.ClassResponse;
import com.ayush.SMS.Entity.ClassSection;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.ClassSectionRepo;
import com.ayush.SMS.Repository.ExamRepo;
import com.ayush.SMS.Repository.StudentRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClassService {

    private final ClassSectionRepo classRepo;
    private final StudentRepo studentRepo;
    private final ExamRepo examRepo;
    private final AuditService audit;

    public ClassService(ClassSectionRepo classRepo, StudentRepo studentRepo, ExamRepo examRepo, AuditService audit) {
        this.classRepo = classRepo;
        this.studentRepo = studentRepo;
        this.examRepo = examRepo;
        this.audit = audit;
    }

    public ClassSection require(Long id) {
        return classRepo.findById(id).orElseThrow(() -> ApiException.notFound("Class not found"));
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> list() {
        return classRepo.findAllByOrderByNameAscSectionAsc().stream()
                .map(c -> Mappers.clazz(c, studentRepo.countByClassSectionId(c.getId())))
                .toList();
    }

    @Transactional
    public ClassResponse create(ClassRequest request) {
        String name = request.name().trim();
        String section = request.section().trim().toUpperCase();
        if (classRepo.existsByNameIgnoreCaseAndSectionIgnoreCase(name, section)) {
            throw ApiException.conflict("Class " + name + "-" + section + " already exists");
        }
        ClassSection c = new ClassSection();
        c.setName(name);
        c.setSection(section);
        c = classRepo.save(c);
        audit.log("CLASS_CREATED", c.displayName());
        return Mappers.clazz(c, 0);
    }

    @Transactional
    public void delete(Long id) {
        ClassSection c = require(id);
        if (studentRepo.countByClassSectionId(id) > 0) {
            throw ApiException.conflict("Move or remove the students of this class first");
        }
        if (examRepo.existsByClassSectionId(id)) {
            throw ApiException.conflict("Remove the exams of this class first");
        }
        classRepo.delete(c);
        audit.log("CLASS_DELETED", c.displayName());
    }
}
