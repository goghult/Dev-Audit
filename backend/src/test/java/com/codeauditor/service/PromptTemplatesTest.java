package com.codeauditor.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PromptTemplatesTest {

    @Test
    void systemPromptDefinesTheAuditorRole() {
        assertThat(PromptTemplates.SYSTEM_PROMPT)
                .contains("AI Code Auditor")
                .contains("OWASP Top 10");
    }

    @Test
    void analysisPromptsRetainRequiredTemplateParameters() {
        assertThat(PromptTemplates.FULL_ANALYSIS_PROMPT)
                .contains("{language}")
                .contains("{code}")
                .contains("overall score");
        assertThat(PromptTemplates.PR_DESCRIPTION_PROMPT)
                .contains("{code}")
                .contains("{diff}");
    }

    @Test
    void specializedPromptsDescribeTheirRequestedAnalysis() {
        assertThat(PromptTemplates.SECURITY_AUDIT_PROMPT).contains("security issues");
        assertThat(PromptTemplates.COMPLEXITY_ANALYSIS_PROMPT).contains("Big-O");
        assertThat(PromptTemplates.REFACTORING_PROMPT).contains("refactor");
    }
}