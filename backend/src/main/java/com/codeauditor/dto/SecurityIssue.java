package com.codeauditor.dto;

public record SecurityIssue(
    String type,
    String owaspCategory,
    String severity,
    String description,
    Integer lineNumber,
    String suggestion
) {}
