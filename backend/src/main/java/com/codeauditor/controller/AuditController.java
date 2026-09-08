package com.codeauditor.controller;

import com.codeauditor.dto.AuditHistoryResponse;
import com.codeauditor.dto.AuditRequest;
import com.codeauditor.dto.CodeAuditResult;
import com.codeauditor.entity.AuditRecord;
import com.codeauditor.entity.User;
import com.codeauditor.service.AuditHistoryService;
import com.codeauditor.service.CodeAnalysisService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final CodeAnalysisService codeAnalysisService;
    private final AuditHistoryService auditHistoryService;
    private final ObjectMapper objectMapper;

    /**
     * Full structured analysis (blocking).
     * Saves the result to the audit history table.
     */
    @PostMapping("/analyze")
    public ResponseEntity<CodeAuditResult> analyze(
            @Valid @RequestBody AuditRequest request,
            @AuthenticationPrincipal User user) {

        String provider = request.resolvedProvider();
        log.info("Analyze request — language={}, provider={}", request.language(), provider);

        CodeAuditResult result = codeAnalysisService.analyzeCode(
                request.code(), request.language(), provider);

        try {
            AuditRecord record = AuditRecord.builder()
                    .user(user)
                    .sourceCode(request.code())
                    .language(request.language())
                    .resultJson(objectMapper.writeValueAsString(result))
                    .overallScore(result.overallScore())
                    .build();
            auditHistoryService.saveAuditRecord(record);
        } catch (JsonProcessingException e) {
            log.warn("Failed to persist audit record: {}", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Streaming analysis via Server-Sent Events.
     * Returns raw token chunks as {@code text/event-stream}.
     */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> stream(
            @Valid @RequestBody AuditRequest request,
            @AuthenticationPrincipal User user) {
        String provider = request.resolvedProvider();
        log.info("Stream request — language={}, provider={}", request.language(), provider);
                AtomicReference<StringBuilder> streamedResult = new AtomicReference<>(new StringBuilder());
                return codeAnalysisService.streamAnalysis(request.code(), request.language(), provider)
                                .doOnNext(streamedResult.get()::append)
                                .doOnError(error -> log.warn("Streaming analysis failed: {}", error.getMessage()))
                                .doOnComplete(() -> persistStreamedAudit(request, user, streamedResult.get().toString()));
    }

        private void persistStreamedAudit(AuditRequest request, User user, String streamedResult) {
                try {
                        String json = streamedResult.trim()
                                        .replaceAll("(?s)^```(?:json)?\\s*", "")
                                        .replaceAll("(?s)\\s*```$", "")
                                        .trim();
                        int start = json.indexOf('{');
                        int end = json.lastIndexOf('}');
                        if (start < 0 || end <= start) {
                                log.warn("Stream completed without a structured audit result");
                                return;
                        }
                        CodeAuditResult result = objectMapper.readValue(json.substring(start, end + 1), CodeAuditResult.class);
                        AuditRecord record = AuditRecord.builder()
                                        .user(user)
                                        .sourceCode(request.code())
                                        .language(request.language())
                                        .resultJson(objectMapper.writeValueAsString(result))
                                        .overallScore(result.overallScore())
                                        .build();
                        auditHistoryService.saveAuditRecord(record);
                } catch (Exception e) {
                        log.warn("Failed to persist streamed audit record: {}", e.getMessage());
                }
        }

    /**
     * Generate a professional PR description.
     * Accepts { code, diff, provider } in the request body.
     */
    @PostMapping("/pr-description")
    public ResponseEntity<Map<String, String>> generatePrDescription(
            @RequestBody Map<String, String> request) {

        String provider = request.getOrDefault("provider", "gemini");
        String desc = codeAnalysisService.generatePrDescription(
                request.getOrDefault("code", ""),
                request.getOrDefault("diff", ""),
                provider);
        return ResponseEntity.ok(Map.of("prDescription", desc));
    }

    /** Returns a paginated list of the authenticated user's past audits. */
    @GetMapping("/history")
    public ResponseEntity<AuditHistoryResponse> getHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(auditHistoryService.getHistory(user, page, size));
    }

    /** Returns a single audit record by ID (must belong to the authenticated user). */
    @GetMapping("/{id}")
    public ResponseEntity<AuditRecord> getAudit(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return auditHistoryService.getAuditById(id)
                .filter(record -> record.getUser().getId().equals(user.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Utility endpoint — returns the list of supported providers and their models.
     * No auth required (public info).
     */
    @GetMapping("/providers")
    public ResponseEntity<Map<String, Object>> getProviders() {
        return ResponseEntity.ok(Map.of(
                "providers", java.util.List.of(
                        Map.of(
                                "id", "gemini",
                                "name", "Google Gemini 2.0 Flash",
                                "model", "gemini-2.0-flash",
                                "badge", "Google AI",
                                "color", "blue",
                                "free", true,
                                "description", "Fast, multimodal model with 1M token context"
                        ),
                        Map.of(
                                "id", "ollama",
                                "name", "Llama 3.2 (Ollama)",
                                "model", "llama3.2",
                                "badge", "Ollama",
                                "color", "green",
                                "free", true,
                                "description", "Local model running through Ollama"
                        )
                )
        ));
    }
}
