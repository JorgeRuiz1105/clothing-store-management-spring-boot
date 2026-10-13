package com.jorgeruiz.springclothingstore.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreatePaymentDTO(
        BigDecimal amount,
        Long debtId
) {
}
