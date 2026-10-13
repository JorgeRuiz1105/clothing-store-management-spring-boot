package com.jorgeruiz.springclothingstore.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "debt")
public class Debt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private DebtStates state = DebtStates.PENDIENTE;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToOne
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    public Debt(){

    }

    public Debt(Long id, Customer customer, Sale sale) {
        this.id = id;
        this.date = LocalDateTime.now();
        this.customer = validateCustomer(customer);
        this.sale = validateSale(sale);
    }

    public Debt(Customer customer, Sale sale){
        this.date = LocalDateTime.now();
        this.customer = validateCustomer(customer);
        this.sale = validateSale(sale);
    }

    public Debt(Long id, Customer customer, Sale sale, LocalDateTime date){
        this.id = id;
        this.customer = validateCustomer(customer);
        this.sale = validateSale(sale);
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public DebtStates getState() {
        return state;
    }

    public void setState(DebtStates state) {
        this.state = state;
    }

    public Customer getCustomer() {
        return customer;
    }

    public Sale getSale() {
        return sale;
    }

    public BigDecimal calcTotalAmount(){
        return this.sale.calcTotalPrice();
    }

    public BigDecimal calcOutstanding(BigDecimal totalPaid){
        return this.calcTotalAmount().subtract(totalPaid);
    }

    private Customer validateCustomer(Customer customer){
        if(customer == null){
            throw new IllegalArgumentException("Debe especificar el cliente asociado a la deuda!");
        }
        return customer;
    }

    private Sale validateSale(Sale sale){
        if(sale == null){
            throw new IllegalArgumentException("Debe especificar la factura asociada a la deuda!");
        }
        return sale;
    }
}
