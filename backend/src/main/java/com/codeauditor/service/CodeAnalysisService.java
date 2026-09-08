package com.codeauditor.service;

import com.codeauditor.dto.CodeAuditResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import reactor.core.publisher.Flux;

import java.util.Map;

/**
 * Core AI orchestration service.
 *
 * <p>Supports two free AI providers selectable per-request:
 * <ul>
 *   <li><b>gemini</b>  – Google Gemini 2.0 Flash (default)</li>
 *   <li><b>ollama</b>  – Local Ollama model</li>
 * </ul>
 */
@Service
public class CodeAnalysisService {

    /** ChatClient backed by Google Gemini via Spring AI google-genai starter. */
        private final ChatClient geminiClient;

    /**
    * ChatClient backed by local Ollama via Spring AI OpenAI starter.
     */
    private final ChatClient groqClient;
    private final WebClient ollamaClient;
    private final ObjectMapper objectMapper;
    private final String ollamaModel;

    public CodeAnalysisService(
                                                @Qualifier("googleGenAiChatModel") ObjectProvider<ChatModel> geminiChatModel,
            @Qualifier("openAiChatModel") OpenAiChatModel openAiChatModel,
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${ollama.base-url:http://localhost:11434}") String ollamaBaseUrl,
            @Value("${ollama.model:llama3.2}") String ollamaModel) {

                ChatModel googleModel = geminiChatModel.getIfAvailable();
                this.geminiClient = googleModel == null ? null : ChatClient.builder(googleModel)
                                .defaultSystem(PromptTemplates.SYSTEM_PROMPT)
                                .build();

        // Build a ChatClient directly from the auto-configured OpenAI model (= Groq)
        this.groqClient = ChatClient.builder(openAiChatModel)
                .defaultSystem(PromptTemplates.SYSTEM_PROMPT)
                .build();
        this.ollamaClient = webClientBuilder.baseUrl(ollamaBaseUrl).build();
        this.objectMapper = objectMapper;
        this.ollamaModel = ollamaModel;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Full structured analysis — returns a typed {@link CodeAuditResult}.
     *
     * @param code     source code to analyse
     * @param language programming language name (e.g. "Java")
     * @param provider "gemini" or "groq" (case-insensitive; null → gemini)
     */
    @SuppressWarnings("null")
    public CodeAuditResult analyzeCode(String code, String language, String provider) {
        if ("ollama".equalsIgnoreCase(provider)) {
            String json = streamAnalysis(code, language, provider).collectList().blockOptional()
                    .orElseThrow(() -> new IllegalStateException("Ollama returned no analysis"))
                    .stream().reduce("", String::concat);
            try {
                return objectMapper.readValue(json, CodeAuditResult.class);
            } catch (Exception e) {
                throw new IllegalStateException("Ollama returned invalid audit JSON", e);
            }
        }
        return client(provider).prompt()
                .user(u -> u.text(PromptTemplates.FULL_ANALYSIS_PROMPT)
                        .param("language", language)
                        .param("code", code))
                .call()
                .entity(CodeAuditResult.class);
    }

    /**
     * Streaming analysis — returns raw token chunks as {@code Flux<String>}.
     * Ideal for the SSE endpoint.
     */
    public Flux<String> streamAnalysis(String code, String language, String provider) {
        if ("ollama".equalsIgnoreCase(provider)) {
            String prompt = PromptTemplates.FULL_ANALYSIS_PROMPT
                .replace("{language}", language)
                .replace("{code}", code);
            Map<String, Object> request = Map.of(
                "model", ollamaModel,
                "stream", true,
                "format", "json",
                "messages", java.util.List.of(
                    Map.of("role", "system", "content", PromptTemplates.SYSTEM_PROMPT),
                    Map.of("role", "user", "content", prompt)));
            return ollamaClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(String.class)
                .flatMapIterable(chunk -> java.util.Arrays.asList(chunk.split("\\R")))
                .map(this::extractOllamaContent)
                .filter(content -> !content.isEmpty());
        }
        return client(provider).prompt()
                .user(u -> u.text(PromptTemplates.FULL_ANALYSIS_PROMPT)
                        .param("language", language)
                        .param("code", code))
                .stream()
                .content();
    }

    private String extractOllamaContent(String line) {
        try {
            JsonNode node = objectMapper.readTree(line);
            return node.path("message").path("content").asText("");
        } catch (Exception ignored) {
            return "";
        }
    }

    /**
     * Generates a professional PR description from code + optional diff.
     */
    public String generatePrDescription(String code, String diff, String provider) {
        return client(provider).prompt()
                .user(u -> u.text(PromptTemplates.PR_DESCRIPTION_PROMPT)
                        .param("code", code)
                        .param("diff", diff == null ? "" : diff))
                .call()
                .content();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Selects the appropriate {@link ChatClient} for the requested provider. */
    private ChatClient client(String provider) {
        if ("ollama".equalsIgnoreCase(provider) || "groq".equalsIgnoreCase(provider)) {
            return groqClient;
        }
                return geminiClient != null ? geminiClient : groqClient;
    }
}
