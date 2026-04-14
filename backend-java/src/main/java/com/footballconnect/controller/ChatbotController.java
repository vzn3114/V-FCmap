package com.footballconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.dto.ChatbotMessageRequest;
import com.footballconnect.dto.ChatbotMessageResponse;
import com.footballconnect.service.ChatbotService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "AI Chatbot", description = "Skeleton chatbot tu van san bong")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @GetMapping("/health")
    @Operation(summary = "Health check for chatbot")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chatbot is ready");
    }

    @PostMapping("/message")
    @Operation(summary = "Send a message to chatbot and get recommendations")
    public ResponseEntity<ChatbotMessageResponse> message(@Valid @RequestBody ChatbotMessageRequest request) {
        ChatbotMessageResponse response = chatbotService.processMessage(request);
        return ResponseEntity.ok(response);
    }
}
