package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.model.Customer;

import java.util.List;

public interface CustomerService {
    Customer saveCustomer(Customer customer);

    Customer getCustomerById(Long id);

    Customer getCustomerByDocument(String document);

    List<Customer> getAllCustomers();

    Customer updateCustomer(Long id, String name, String phone, String address);

    void deleteCustomerById(Long id);

    void deleteCustomerByDocument(String document);
}
