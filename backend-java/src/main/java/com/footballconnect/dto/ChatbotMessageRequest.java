package com.footballconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotMessageRequest {

    @NotBlank(message = "message is required")
    private String message;

    private String district;
    private String city;
    private Double maxPrice;
    private Boolean hasParking;
}
