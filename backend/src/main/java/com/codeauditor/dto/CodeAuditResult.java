package com.codeauditor.dto;

import java.util.List;

public record CodeAuditResult(
    String summary,
    List<SecurityIssue> securityIssues,
    ComplexityAnalysis complexity,
    String refactoredCode,
    String prDescription,
    List<CodeSmell> codeSmells,
    Integer overallScore
) {}
