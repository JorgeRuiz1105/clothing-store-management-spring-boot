package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.exception.EntityNotFoundException;
import com.jorgeruiz.springclothingstore.exception.PaymentExceedsDebtException;
import com.jorgeruiz.springclothingstore.model.Debt;
import com.jorgeruiz.springclothingstore.model.DebtStates;
import com.jorgeruiz.springclothingstore.model.Payment;
import com.jorgeruiz.springclothingstore.repository.DebtRepository;
import com.jorgeruiz.springclothingstore.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService{

    private final PaymentRepository paymentRepository;
    private final DebtRepository debtRepository;

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, DebtRepository debtRepository) {
        this.paymentRepository = paymentRepository;
        this.debtRepository = debtRepository;
    }

    @Transactional
    @Override
    public Payment savePayment(BigDecimal amount, Long debtId) {
        if (amount == null) {
            throw new IllegalArgumentException("El abono no puede ser nulo!");
        }

        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Deuda no encontrada"));

        if (debt.getState() != DebtStates.PENDIENTE) {
            throw new IllegalArgumentException(
                    "No se pueden registrar abonos a una deuda que no esta pendiente");
        }

        Payment payment = new Payment(amount, debt);

        BigDecimal paidSoFar = calcTotalPaid(debt);
        if (paidSoFar == null) {
            paidSoFar = BigDecimal.ZERO;
        }

        BigDecimal outstanding = debt.calcOutstanding(paidSoFar);

        if (amount.compareTo(outstanding) > 0) {
            throw new PaymentExceedsDebtException(
                    "El abono no puede ser mayor a la cantidad que debe!");
        }

        Payment savedPayment = paymentRepository.save(payment);

        BigDecimal newTotalPaid = paidSoFar.add(amount);

        if (debt.calcOutstanding(newTotalPaid).compareTo(BigDecimal.ZERO) <= 0) {
            debt.setState(DebtStates.PAGADA);
            debtRepository.save(debt);
        }

        return savedPayment;
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id).orElseThrow(()
                -> new EntityNotFoundException("No se encontró el abono con ID: " + id));
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public BigDecimal calcTotalPaid(Debt debt) {
        return paymentRepository.sumAmountByDebtId(debt.getId());
    }
}
