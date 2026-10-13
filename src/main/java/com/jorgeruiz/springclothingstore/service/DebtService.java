package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.model.Debt;

import java.util.List;

public interface DebtService {
    Debt saveDebt(Debt debt);

    Debt getDebtById(Long id);

    List<Debt> getAllDebts();

    boolean hasHighDebt(String document);
}
