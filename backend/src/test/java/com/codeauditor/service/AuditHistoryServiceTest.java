package com.codeauditor.service;

import com.codeauditor.entity.AuditRecord;
import com.codeauditor.entity.User;
import com.codeauditor.repository.AuditRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditHistoryServiceTest {

    @Mock
    private AuditRecordRepository auditRecordRepository;

    private AuditHistoryService auditHistoryService;

    @BeforeEach
    void setUp() {
        auditHistoryService = new AuditHistoryService(auditRecordRepository);
    }

    @Test
    void saveAuditRecordDelegatesToRepository() {
        AuditRecord record = AuditRecord.builder().language("Java").build();

        auditHistoryService.saveAuditRecord(record);

        verify(auditRecordRepository).save(record);
    }

    @Test
    void getHistoryMapsRecordsAndPageMetadata() {
        User user = User.builder().username("alice").build();
        LocalDateTime createdAt = LocalDateTime.of(2026, 9, 8, 12, 0);
        AuditRecord record = AuditRecord.builder()
                .id(7L)
                .language("Java")
                .overallScore(92)
                .createdAt(createdAt)
                .build();
        PageRequest pageRequest = PageRequest.of(1, 1);
        when(auditRecordRepository.findByUserOrderByCreatedAtDesc(eq(user), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(record), pageRequest, 2));

        var response = auditHistoryService.getHistory(user, 1, 1);

        assertThat(response.content()).singleElement().satisfies(dto -> {
            assertThat(dto.id()).isEqualTo(7L);
            assertThat(dto.language()).isEqualTo("Java");
            assertThat(dto.overallScore()).isEqualTo(92);
            assertThat(dto.createdAt()).isEqualTo(createdAt.toString());
            assertThat(dto.summary()).isEqualTo("Summary available in JSON");
        });
        assertThat(response.pageNo()).isEqualTo(1);
        assertThat(response.pageSize()).isEqualTo(1);
        assertThat(response.totalElements()).isEqualTo(2);
        assertThat(response.totalPages()).isEqualTo(2);
        assertThat(response.last()).isTrue();
    }

    @Test
    void getAuditByIdReturnsRepositoryResult() {
        AuditRecord record = AuditRecord.builder().id(3L).build();
        when(auditRecordRepository.findById(3L)).thenReturn(Optional.of(record));

        assertThat(auditHistoryService.getAuditById(3L)).containsSame(record);
        verify(auditRecordRepository).findById(3L);
    }
}