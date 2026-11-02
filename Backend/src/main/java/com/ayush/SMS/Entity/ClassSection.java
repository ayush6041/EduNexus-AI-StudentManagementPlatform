package com.ayush.SMS.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "class_sections",
        uniqueConstraints = @UniqueConstraint(columnNames = {"name", "section"}))
@Getter
@Setter
@NoArgsConstructor
public class ClassSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(nullable = false, length = 10)
    private String section;

    public String displayName() {
        return name + "-" + section;
    }
}
