package com.jorgeruiz.springclothingstore.controller;

import com.jorgeruiz.springclothingstore.model.Debt;
import com.jorgeruiz.springclothingstore.service.DebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/debts")
public class DebtController {
    private final DebtService debtService;

    @Autowired
    public DebtController(DebtService debtService) {
        this.debtService = debtService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Debt> getDebtById(@PathVariable Long id){
        Debt debt = debtService.getDebtById(id);
        return ResponseEntity.ok(debt);
    }

    @GetMapping
    public ResponseEntity<List<Debt>> getAllDebts(){
        List<Debt> debts = debtService.getAllDebts();
        return ResponseEntity.ok(debts);
    }
}
