package com.footballconnect.service.payment;

import org.springframework.stereotype.Component;

import com.footballconnect.exception.BadRequestException;

/**
 * Payment Processor Factory - creates appropriate payment processor based on method
 */
@Component
public class PaymentProcessorFactory {

    private final CodPaymentProcessor codProcessor;
    private final BankTransferPaymentProcessor bankProcessor;

    public PaymentProcessorFactory(CodPaymentProcessor codProcessor,
                                   BankTransferPaymentProcessor bankProcessor) {
        this.codProcessor = codProcessor;
        this.bankProcessor = bankProcessor;
    }

    /**
     * Get payment processor for the given payment method
     * @param paymentMethod payment method name (e.g., "COD", "BANK_TRANSFER")
     * @return appropriate PaymentProcessor implementation
     * @throws BadRequestException if payment method is not supported
     */
    public PaymentProcessor getProcessor(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new BadRequestException("Payment method is required");
        }

        return switch (paymentMethod.toUpperCase()) {
            case "COD" -> codProcessor;
            case "BANK_TRANSFER", "BANK" -> bankProcessor;
            default -> throw new BadRequestException("Unsupported payment method: " + paymentMethod);
        };
    }

    /**
     * Check if payment method is supported
     * @param paymentMethod payment method name
     * @return true if supported
     */
    public boolean isSupported(String paymentMethod) {
        try {
            getProcessor(paymentMethod);
            return true;
        } catch (BadRequestException e) {
            return false;
        }
    }

    /**
     * Get all supported payment methods
     * @return array of supported payment method names
     */
    public String[] getSupportedMethods() {
        return new String[]{"COD", "BANK_TRANSFER"};
    }
}
