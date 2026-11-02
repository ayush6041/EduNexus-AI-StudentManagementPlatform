package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExamRepo extends JpaRepository<Exam, Long> {

    List<Exam> findAllByOrderByExamDateAscStartTimeAsc();

    List<Exam> findByClassSectionIdOrderByExamDateAscStartTimeAsc(Long classId);

    List<Exam> findByClassSectionIdAndExamDateGreaterThanEqualOrderByExamDateAscStartTimeAsc(Long classId, LocalDate date);

    long countByExamDateGreaterThanEqual(LocalDate date);

    boolean existsByClassSectionId(Long classId);
}
