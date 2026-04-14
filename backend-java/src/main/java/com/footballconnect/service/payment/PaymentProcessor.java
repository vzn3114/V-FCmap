package com.footballconnect.service.payment;

import com.footballconnect.domain.entity.Booking;

/**
 * Payment Processor interface - defines contract for all payment methods
 */
public interface PaymentProcessor {
    
    /**
     * Process payment for a booking
     * @param booking the booking to process
     * @param paymentMethod payment method details (e.g., card token, account info)
     * @return transaction ID or reference code from payment provider
     */
    String processPayment(Booking booking, String paymentMethod);

    /**
     * Verify payment result
     * @param transactionId transaction ID from payment provider
     * @return true if payment is confirmed, false otherwise
     */
    boolean verifyPayment(String transactionId);

    /**
     * Refund a payment
     * @param transactionId original transaction ID
     * @param amount amount to refund
     * @return refund transaction ID
     */
    String refundPayment(String transactionId, Double amount);

    /**
     * Get supported payment method name
     * @return payment method name (e.g., "STRIPE", "VNPAY", "COD")
     */
    String getPaymentMethodName();
}
