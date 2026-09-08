package com.codeauditor.dto;

import java.util.List;

public record AuditHistoryResponse(
    List<AuditRecordDto> content,
    int pageNo,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean last
) {
    public record AuditRecordDto(
        Long id,
        String language,
        Integer overallScore,
        String createdAt,
        String summary
    ) {}
}
