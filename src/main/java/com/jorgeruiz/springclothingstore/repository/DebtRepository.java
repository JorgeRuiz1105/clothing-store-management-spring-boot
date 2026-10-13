package com.jorgeruiz.springclothingstore.repository;

import com.jorgeruiz.springclothingstore.model.Debt;
import com.jorgeruiz.springclothingstore.model.DebtStates;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {
    Optional<Debt> findFirstByCustomerDocumentAndStateOrderByDateAsc(String document, DebtStates state);

    List<Debt> findAllByCustomerDocumentAndState(String document, DebtStates states);
}
