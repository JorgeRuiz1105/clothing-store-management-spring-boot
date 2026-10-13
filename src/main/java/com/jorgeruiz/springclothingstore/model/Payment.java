package com.jorgeruiz.springclothingstore.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "debt_id", nullable = false)
    private Debt debt;

    public Payment(){

    }

    public Payment(Long id, BigDecimal amount, Debt debt) {
        this.id = id;
        this.amount = validateAmount(amount);
        this.date = LocalDateTime.now();
        this.debt = validateDebt(debt);
    }

    public Payment(BigDecimal amount, Debt debt){
        this.amount = validateAmount(amount);
        this.date = LocalDateTime.now();
        this.debt = validateDebt(debt);
    }

    public Payment(Long id, BigDecimal amount, Debt debt, LocalDateTime date){
        this.id = id;
        this.amount = validateAmount(amount);
        this.debt = validateDebt(debt);
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public Debt getDebt() {
        return debt;
    }

    private BigDecimal validateAmount(BigDecimal amount){
        if(amount == null || amount.compareTo(BigDecimal.ZERO) <= 0){
            throw new IllegalArgumentException("Ha introducido un valor de abono invalido!");
        }
        return amount;
    }

    private Debt validateDebt(Debt debt){
        if(debt == null){
            throw new IllegalArgumentException("Debe especificar la deuda asociada al abono!");
        }
        return debt;
    }
}
