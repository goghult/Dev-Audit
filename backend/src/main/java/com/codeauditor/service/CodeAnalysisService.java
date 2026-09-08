package com.codeauditor.service;

import com.codeauditor.dto.CodeAuditResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

/** Core AI orchestration service backed only by Google Gemini. */
@Service
public class CodeAnalysisService {

    private final ChatClient geminiClient;

    public CodeAnalysisService(
            @Qualifier("googleGenAiChatModel") ObjectProvider<ChatModel> geminiChatModel) {
        ChatModel googleModel = geminiChatModel.getIfAvailable();
        if (googleModel == null) {
            throw new IllegalStateException("Google Gemini is not configured. Set GOOGLE_GEMINI_API_KEY.");
        }
        this.geminiClient = ChatClient.builder(googleModel)
                .defaultSystem(PromptTemplates.SYSTEM_PROMPT)
                .build();
    }

    public CodeAuditResult analyzeCode(String code, String language, String provider) {
        return geminiClient.prompt()
                .user(u -> u.text(PromptTemplates.FULL_ANALYSIS_PROMPT)
                        .param("language", language)
                        .param("code", code))
                .call()
                .entity(CodeAuditResult.class);
    }

    public Flux<String> streamAnalysis(String code, String language, String provider) {
        return geminiClient.prompt()
                .user(u -> u.text(PromptTemplates.FULL_ANALYSIS_PROMPT)
                        .param("language", language)
                        .param("code", code))
                .stream()
                .content();
    }

    public String generatePrDescription(String code, String diff, String provider) {
        return geminiClient.prompt()
                .user(u -> u.text(PromptTemplates.PR_DESCRIPTION_PROMPT)
                        .param("code", code)
                        .param("diff", diff == null ? "" : diff))
                .call()
                .content();
    }
}
