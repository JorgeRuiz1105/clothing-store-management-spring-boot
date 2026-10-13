package com.jorgeruiz.springclothingstore.dto;

public record DebtWarningDTO(
        String customerDocument,
        boolean hasHighDebt,
        String message
) {
}
