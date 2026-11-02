package com.ayush.SMS.Repository;

import com.ayush.SMS.Entity.Role;
import com.ayush.SMS.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByRole(Role role);

    Optional<User> findByStudentId(Long studentId);

    Optional<User> findByTeacherId(Long teacherId);
}
