package com.codeauditor.dto;

import jakarta.validation.constraints.NotBlank;

public record AuditRequest(
    @NotBlank(message = "Code cannot be empty") String code,
    @NotBlank(message = "Language cannot be empty") String language,
    String provider   // "gemini" (default) or "ollama"
) {
    /** Normalised provider — never null, defaults to "gemini". */
    public String resolvedProvider() {
        return (provider == null || provider.isBlank()) ? "gemini" : provider.toLowerCase();
    }
}
