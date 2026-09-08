package com.codeauditor.service;

import com.codeauditor.dto.AuditHistoryResponse;
import com.codeauditor.entity.AuditRecord;
import com.codeauditor.entity.User;
import com.codeauditor.repository.AuditRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditHistoryService {

    private final AuditRecordRepository auditRecordRepository;

    public void saveAuditRecord(AuditRecord record) {
        auditRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public AuditHistoryResponse getHistory(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditRecord> records = auditRecordRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        
        List<AuditHistoryResponse.AuditRecordDto> dtos = records.getContent().stream()
                .map(r -> new AuditHistoryResponse.AuditRecordDto(
                        r.getId(),
                        r.getLanguage(),
                        r.getOverallScore(),
                        r.getCreatedAt().toString(),
                        "Summary available in JSON"
                ))
                .collect(Collectors.toList());

        return new AuditHistoryResponse(
                dtos,
                records.getNumber(),
                records.getSize(),
                records.getTotalElements(),
                records.getTotalPages(),
                records.isLast()
        );
    }

    public Optional<AuditRecord> getAuditById(Long id) {
        return auditRecordRepository.findById(id);
    }
}
