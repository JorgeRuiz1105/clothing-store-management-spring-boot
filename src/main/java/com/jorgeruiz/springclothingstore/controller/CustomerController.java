package com.jorgeruiz.springclothingstore.controller;

import com.jorgeruiz.springclothingstore.dto.CustomerDTO;
import com.jorgeruiz.springclothingstore.dto.DebtWarningDTO;
import com.jorgeruiz.springclothingstore.model.Customer;
import com.jorgeruiz.springclothingstore.service.CustomerService;
import com.jorgeruiz.springclothingstore.service.DebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/customers")
public class CustomerController {
    private final CustomerService customerService;
    private final DebtService debtService;

    @Autowired
    public CustomerController(CustomerService customerService, DebtService debtService) {
        this.customerService = customerService;
        this.debtService = debtService;
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody CustomerDTO request){
        Customer newCustomer = new Customer(
                request.id(),
                request.document(),
                request.name(),
                request.phone(),
                request.address()
        );
        Customer savedCustomer = customerService.saveCustomer(newCustomer);
        return new ResponseEntity<>(savedCustomer, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id){
        Customer customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @GetMapping("/document/{document}")
    public ResponseEntity<Customer> getCustomerByDocument(@PathVariable String document){
        Customer customer = customerService.getCustomerByDocument(document);
        return ResponseEntity.ok(customer);
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(){
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{document}/debt-warning")
    public ResponseEntity<DebtWarningDTO> getDebtWarning(
            @PathVariable String document) {

        customerService.getCustomerByDocument(document);

        boolean hasHighDebt = debtService.hasHighDebt(document);

        String message = hasHighDebt
                ? "El cliente tiene una deuda pendiente elevada (mayor a $500.000 COP). ¿Desea continuar con la venta?"
                : "El cliente no tiene una deuda pendiente elevada.";

        DebtWarningDTO response = new DebtWarningDTO(
                document,
                hasHighDebt,
                message
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody CustomerDTO request){
        Customer updatedCustomer = customerService.updateCustomer(
                id,
                request.name(),
                request.phone(),
                request.address()
        );
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticleById(@PathVariable Long id){
        customerService.deleteCustomerById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/document/{document}")
    public ResponseEntity<Void> deleteArticleByDocument(@PathVariable String document){
        customerService.deleteCustomerByDocument(document);
        return ResponseEntity.noContent().build();
    }
}
