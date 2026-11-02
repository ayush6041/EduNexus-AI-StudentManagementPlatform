package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherRepo extends JpaRepository<Teacher, Long> {

    List<Teacher> findAllByOrderByNameAsc();

    boolean existsByEmailIgnoreCase(String email);
}
