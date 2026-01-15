package com.buneko.blooms.repository;

import com.buneko.blooms.model.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentRepository extends JpaRepository<Content, Integer> {
    Page<Content> findByPlatform(Content.Platform platform, Pageable pageable);
}

