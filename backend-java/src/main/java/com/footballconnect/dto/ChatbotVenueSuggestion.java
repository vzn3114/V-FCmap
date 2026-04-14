package com.footballconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotVenueSuggestion {
    private Long id;
    private String name;
    private String district;
    private String city;
    private Double normalPrice;
    private Double rating;
}
