package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.Attendance;
import com.ayush.SMS.Entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface AttendanceRepo extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudent_ClassSection_IdAndAttendanceDate(Long classId, LocalDate date);

    List<Attendance> findByStudentIdOrderByAttendanceDateDesc(Long studentId);

    long countByAttendanceDate(LocalDate date);

    long countByAttendanceDateAndStatusNot(LocalDate date, AttendanceStatus status);

    void deleteByStudentId(Long studentId);

    /** rows: [studentId, attended (present + late), total] */
    @Query("""
            select a.student.id,
                   sum(case when a.status = com.ayush.SMS.Entity.AttendanceStatus.ABSENT then 0 else 1 end),
                   count(a)
            from Attendance a
            where a.student.id in :ids
            group by a.student.id
            """)
    List<Object[]> summarize(@Param("ids") Collection<Long> ids);
}
