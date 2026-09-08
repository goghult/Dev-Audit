package com.codeauditor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.ai.model.chat.client.autoconfigure.ChatClientAutoConfiguration;

@SpringBootApplication(exclude = ChatClientAutoConfiguration.class)
public class CodeAuditorApplication {
    public static void main(String[] args) {
        SpringApplication.run(CodeAuditorApplication.class, args);
    }
}
