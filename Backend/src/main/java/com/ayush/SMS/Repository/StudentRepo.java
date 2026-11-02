package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentRepo extends JpaRepository<Student, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByAdmissionNoIgnoreCase(String admissionNo);

    List<Student> findByClassSectionIdOrderByNameAsc(Long classId);

    long countByClassSectionId(Long classId);

    /**
     * Search + filter. q matches name / email / admission number / username.
     * When useAtt is true only students whose overall attendance percentage
     * lies in [lo, hi] are returned (students with no attendance rows are excluded).
     */
    @Query("""
            select s from Student s
            where (:classId is null or s.classSection.id = :classId)
              and (:q is null
                   or lower(s.name) like :q
                   or lower(s.email) like :q
                   or lower(s.admissionNo) like :q
                   or exists (select u.id from User u where u.student = s and lower(u.username) like :q))
              and (:useAtt = false or s.id in (
                   select a.student.id from Attendance a
                   group by a.student.id
                   having 100.0 * sum(case when a.status = com.ayush.SMS.Entity.AttendanceStatus.ABSENT then 0 else 1 end) / count(a)
                          between :lo and :hi))
            """)
    Page<Student> search(@Param("q") String q,
                         @Param("classId") Long classId,
                         @Param("useAtt") boolean useAtt,
                         @Param("lo") double lo,
                         @Param("hi") double hi,
                         Pageable pageable);
}
