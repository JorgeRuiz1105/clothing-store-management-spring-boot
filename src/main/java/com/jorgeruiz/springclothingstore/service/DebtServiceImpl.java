package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.exception.EntityNotFoundException;
import com.jorgeruiz.springclothingstore.model.Debt;
import com.jorgeruiz.springclothingstore.model.DebtStates;
import com.jorgeruiz.springclothingstore.repository.DebtRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DebtServiceImpl implements DebtService{

    private final DebtRepository debtRepository;
    private final PaymentService paymentService;

    private static final BigDecimal HIGH_DEBT_VALUE = BigDecimal.valueOf(500000);

    @Autowired
    public DebtServiceImpl(DebtRepository debtRepository, PaymentService paymentService) {
        this.debtRepository = debtRepository;
        this.paymentService = paymentService;
    }

    @Transactional
    @Override
    public Debt saveDebt(Debt debt) {
        if(debt == null){
            throw new IllegalArgumentException("La deuda no puede ser nula!");
        }
        return debtRepository.save(debt);
    }

    @Override
    public Debt getDebtById(Long id) {
        return debtRepository.findById(id).orElseThrow(()
                -> new EntityNotFoundException("No se encontró la deuda con ID: " + id));
    }

    @Override
    public List<Debt> getAllDebts() {
        return debtRepository.findAll();
    }

    @Override
    public boolean hasHighDebt(String document) {
        List<Debt> debts = debtRepository.findAllByCustomerDocumentAndState(document, DebtStates.PENDIENTE);

        BigDecimal totalDebt = BigDecimal.ZERO;

        for(Debt debt : debts){
            BigDecimal totalPaid = paymentService.calcTotalPaid(debt);
            BigDecimal outstanding = debt.calcOutstanding(totalPaid);

            totalDebt = totalDebt.add(outstanding);
        }
        return totalDebt.compareTo(HIGH_DEBT_VALUE) > 0;
    }
}
