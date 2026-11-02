package com.ayush.SMS.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "marks",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "exam_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @Column(nullable = false)
    private double marksObtained;

    @Column(length = 150)
    private String updatedBy;

    private LocalDateTime updatedAt;
}
