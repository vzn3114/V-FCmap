package com.footballconnect.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotMessageResponse {
    private String answer;
    private String detectedIntent;
    private List<ChatbotVenueSuggestion> venueSuggestions;
}
