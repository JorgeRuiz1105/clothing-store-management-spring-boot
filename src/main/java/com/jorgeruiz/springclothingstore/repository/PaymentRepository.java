package com.jorgeruiz.springclothingstore.repository;

import com.jorgeruiz.springclothingstore.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.debt.id = :debtId")
    BigDecimal sumAmountByDebtId(Long debtId);
}
