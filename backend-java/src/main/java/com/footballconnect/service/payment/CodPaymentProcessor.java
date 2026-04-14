package com.footballconnect.service.payment;

import org.springframework.stereotype.Component;

import com.footballconnect.domain.entity.Booking;

/**
 * Cash on Delivery Payment Processor - No external gateway required
 */
@Component
public class CodPaymentProcessor implements PaymentProcessor {

    @Override
    public String processPayment(Booking booking, String paymentMethod) {
        // For COD, we just generate a transaction ID for tracking
        String transactionId = "COD-" + booking.getId() + "-" + System.currentTimeMillis();
        return transactionId;
    }

    @Override
    public boolean verifyPayment(String transactionId) {
        // COD is considered verified upon check-in
        return transactionId != null && transactionId.startsWith("COD-");
    }

    @Override
    public String refundPayment(String transactionId, Double amount) {
        // COD refund - just mark as refunded
        return "REFUND-" + transactionId + "-" + System.currentTimeMillis();
    }

    @Override
    public String getPaymentMethodName() {
        return "COD";
    }
}
