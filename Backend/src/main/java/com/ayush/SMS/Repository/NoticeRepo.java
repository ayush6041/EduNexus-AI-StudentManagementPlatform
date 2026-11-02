package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NoticeRepo extends JpaRepository<Notice, Long> {

    List<Notice> findAllByOrderByCreatedAtDesc();

    @Query("select n from Notice n where n.classSection is null or n.classSection.id = :classId order by n.createdAt desc")
    List<Notice> findVisibleToClass(@Param("classId") Long classId);
}
