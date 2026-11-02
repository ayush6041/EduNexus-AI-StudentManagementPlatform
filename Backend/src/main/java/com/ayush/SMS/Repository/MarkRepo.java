package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarkRepo extends JpaRepository<Mark, Long> {

    List<Mark> findByExamId(Long examId);

    List<Mark> findByStudentId(Long studentId);

    Optional<Mark> findByStudentIdAndExamId(Long studentId, Long examId);

    void deleteByExamId(Long examId);

    void deleteByStudentId(Long studentId);
}
