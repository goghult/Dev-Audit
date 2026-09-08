package com.codeauditor.dto;

public record ComplexityAnalysis(
    String timeComplexity,
    String spaceComplexity,
    String explanation
) {}
