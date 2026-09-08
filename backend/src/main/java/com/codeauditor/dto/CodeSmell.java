package com.codeauditor.dto;

public record CodeSmell(
    String name,
    String description,
    Integer lineNumber,
    String suggestion
) {}
