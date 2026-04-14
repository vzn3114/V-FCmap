package com.footballconnect.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Venue;
import com.footballconnect.dto.ChatbotMessageRequest;
import com.footballconnect.dto.ChatbotMessageResponse;
import com.footballconnect.dto.ChatbotVenueSuggestion;

@Service
public class ChatbotService {

    private final VenueService venueService;

    public ChatbotService(VenueService venueService) {
        this.venueService = venueService;
    }

    public ChatbotMessageResponse processMessage(ChatbotMessageRequest request) {
        String normalized = request.getMessage() == null
                ? ""
                : request.getMessage().trim().toLowerCase(Locale.ROOT);

        String intent = detectIntent(normalized);
        List<ChatbotVenueSuggestion> suggestions = List.of();
        String answer;

        if ("venue_recommendation".equals(intent)) {
            List<Venue> venues = venueService.searchVenues(
                    null,
                    null,
                    request.getMaxPrice(),
                    request.getDistrict(),
                    request.getCity(),
                    request.getHasParking(),
                    true,
                    null,
                    null
            );

            suggestions = venues.stream()
                    .limit(5)
                    .map(this::toSuggestion)
                    .toList();

            answer = suggestions.isEmpty()
                    ? "Mình chưa tìm thấy sân phù hợp theo tiêu chí hiện tại. Bạn thử nới ngân sách hoặc khu vực nhé."
                    : "Mình đã tìm thấy một số sân phù hợp. Bạn có thể xem danh sách gợi ý bên dưới.";
        } else if ("booking_help".equals(intent)) {
            answer = "Bạn có thể đặt sân theo 3 bước: chọn sân, chọn khung giờ, xác nhận thanh toán. Nếu muốn, mình có thể gợi ý sân trước.";
        } else if ("pricing_help".equals(intent)) {
            answer = "Bạn có thể gửi thêm ngân sách tối đa (maxPrice) để mình lọc sân theo mức giá phù hợp.";
        } else {
            answer = "Xin chào! Mình là chatbot tu van san bong. Bạn có thể hỏi mình gợi ý sân, giá sân hoặc cách đặt sân.";
        }

        return new ChatbotMessageResponse(answer, intent, suggestions);
    }

    private String detectIntent(String message) {
        if (message.contains("goi y") || message.contains("san") || message.contains("recommend")) {
            return "venue_recommendation";
        }
        if (message.contains("dat san") || message.contains("booking") || message.contains("book")) {
            return "booking_help";
        }
        if (message.contains("gia") || message.contains("price") || message.contains("chi phi")) {
            return "pricing_help";
        }
        return "general";
    }

    private ChatbotVenueSuggestion toSuggestion(Venue venue) {
        String district = venue.getLocation() != null ? venue.getLocation().getDistrict() : null;
        String city = venue.getLocation() != null ? venue.getLocation().getCity() : null;
        Double normalPrice = venue.getPricing() != null ? venue.getPricing().getNormalTime() : null;

        return new ChatbotVenueSuggestion(
                venue.getId(),
                venue.getName(),
                district,
                city,
                normalPrice,
            venue.getAverageRating()
        );
    }
}
