package com.buneko.blooms.repository;

import com.buneko.blooms.model.Customization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomizationRepository extends JpaRepository<Customization, Integer> {
    Page<Customization> findByUserId(Integer userId, Pageable pageable);
    Page<Customization> findByStatus(Customization.CustomizationStatus status, Pageable pageable);
}

