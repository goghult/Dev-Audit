package com.codeauditor.service;

public class PromptTemplates {
    public static final String SYSTEM_PROMPT = "You are an expert AI Code Auditor & PR Assistant. You provide high-quality code reviews, identify security flaws (OWASP Top 10), suggest refactoring, and perform complexity analysis.";
    
    public static final String SECURITY_AUDIT_PROMPT = "Analyze the provided code for security issues, particularly focusing on OWASP Top 10 vulnerabilities.";
    
    public static final String COMPLEXITY_ANALYSIS_PROMPT = "Provide a Big-O complexity analysis (both time and space) for the given code.";
    
    public static final String REFACTORING_PROMPT = "Suggest improvements and refactor the code to adhere to best practices and clean code principles.";
    
    public static final String PR_DESCRIPTION_PROMPT = "Generate a professional PR description summarizing the changes and improvements in this code. Code: {code}. Diff (if any): {diff}";
    
    public static final String FULL_ANALYSIS_PROMPT = "Perform a full code audit on the following {language} code. Provide a structured response with a summary, list of security issues (type, OWASP category, severity, description, line number, suggestion), complexity analysis (time, space, explanation), a refactored version of the code, a PR description, code smells, and an overall score (0-100). Code to analyze:\n{code}";
}
