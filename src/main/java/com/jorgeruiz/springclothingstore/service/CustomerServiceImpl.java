package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.exception.EntityNotFoundException;
import com.jorgeruiz.springclothingstore.model.Customer;
import com.jorgeruiz.springclothingstore.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService{

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional
    @Override
    public Customer saveCustomer(Customer customer) {
        if(customer == null){
            throw new IllegalArgumentException("El cliente no puede ser nulo!");
        }
        return customerRepository.save(customer);
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id).orElseThrow(()
                -> new EntityNotFoundException("No se encontró el cliente con id: " + id));
    }

    @Override
    public Customer getCustomerByDocument(String document) {
        return customerRepository.findCustomerByDocument(document).orElseThrow(()
                -> new EntityNotFoundException("No se encontró el cliente con cedula: " + document));
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Transactional
    @Override
    public Customer updateCustomer(Long id, String name, String phone, String address) {
        Customer existingCustomer = getCustomerById(id);
        Customer updatedCustomer = new Customer(id, existingCustomer.getDocument(), name, phone, address);
        return customerRepository.save(updatedCustomer);
    }

    @Transactional
    @Override
    public void deleteCustomerById(Long id) {
        getCustomerById(id);
        customerRepository.deleteById(id);
    }

    @Transactional
    @Override
    public void deleteCustomerByDocument(String document) {
        getCustomerByDocument(document);
        customerRepository.deleteCustomerByDocument(document);
    }
}
