package com.codeauditor.repository;

import com.codeauditor.entity.AuditRecord;
import com.codeauditor.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRecordRepository extends JpaRepository<AuditRecord, Long> {
    Page<AuditRecord> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    long countByUser(User user);
}
