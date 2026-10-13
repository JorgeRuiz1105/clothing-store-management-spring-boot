package com.jorgeruiz.springclothingstore.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customer")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document", nullable = false, unique = true)
    private String document;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "address", nullable = false)
    private String address;

    public Customer(){

    }

    public Customer(Long id, String document, String name, String phone, String address) {
        this.id = id;
        this.document = validateDocument(document);
        this.name = name;
        this.phone = validatePhone(phone);
        this.address = address;
    }

    public Customer(String document, String name, String phone, String address){
        this.document = validateDocument(document);
        this.name = name;
        this.phone = validatePhone(phone);
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public String getDocument() {
        return document;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = validatePhone(phone);
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    private String validateDocument(String document){
        if(!document.matches("^[0-9]{1,10}$")){
            throw new IllegalArgumentException("Formato de cedula invalido!");
        }
        return document;
    }

    private String validatePhone(String phone){
        if(!phone.matches("^[0-9]{1,10}$")){
            throw new IllegalArgumentException("Formato de telefono invalido!");
        }
        return phone;
    }
}
