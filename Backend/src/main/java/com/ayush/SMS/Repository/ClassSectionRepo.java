package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.ClassSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassSectionRepo extends JpaRepository<ClassSection, Long> {

    List<ClassSection> findAllByOrderByNameAscSectionAsc();

    boolean existsByNameIgnoreCaseAndSectionIgnoreCase(String name, String section);
}
