package com.jorgeruiz.springclothingstore.repository;

import com.jorgeruiz.springclothingstore.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findCustomerByDocument(String document);

    void deleteCustomerByDocument(String document);
}
