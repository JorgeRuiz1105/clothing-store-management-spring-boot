package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.model.Debt;
import com.jorgeruiz.springclothingstore.model.Payment;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {
    Payment savePayment(BigDecimal amount, Long debtId);

    Payment getPaymentById(Long id);

    List<Payment> getAllPayments();

    BigDecimal calcTotalPaid(Debt debt);
}
