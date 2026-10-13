package com.jorgeruiz.springclothingstore.exception;

public class PaymentExceedsDebtException extends RuntimeException {
    public PaymentExceedsDebtException(String message) {
        super(message);
    }
}
