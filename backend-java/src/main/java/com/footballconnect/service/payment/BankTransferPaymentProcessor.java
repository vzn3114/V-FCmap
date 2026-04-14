package com.footballconnect.service.payment;

import org.springframework.stereotype.Component;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.exception.BadRequestException;

/**
 * Bank Transfer Payment Processor - Simple implementation for demo
 */
@Component
public class BankTransferPaymentProcessor implements PaymentProcessor {

    @Override
    public String processPayment(Booking booking, String paymentMethod) {
        // Generate bank transfer reference code
        String referenceCode = "BANK-" + String.format("%06d", booking.getId()) + "-" + System.currentTimeMillis();
        return referenceCode;
    }

    @Override
    public boolean verifyPayment(String transactionId) {
        // In production, call bank API to verify transfer
        // For now, just check format
        return transactionId != null && transactionId.startsWith("BANK-");
    }

    @Override
    public String refundPayment(String transactionId, Double amount) {
        if (!verifyPayment(transactionId)) {
            throw new BadRequestException("Invalid bank transfer transaction");
        }
        return "REFUND-" + transactionId + "-" + System.currentTimeMillis();
    }

    @Override
    public String getPaymentMethodName() {
        return "BANK_TRANSFER";
    }
}
