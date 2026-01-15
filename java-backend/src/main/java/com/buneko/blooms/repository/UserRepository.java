package com.buneko.blooms.repository;

import com.buneko.blooms.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findByRole(User.UserRole role, Pageable pageable);
    Page<User> findByIsActive(Boolean isActive, Pageable pageable);
}

