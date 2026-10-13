package com.jorgeruiz.springclothingstore.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private SaleTypes type;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "sale",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemSale> itemSaleList = new ArrayList<>();

    public Sale(){

    }

    public Sale(Long id, SaleTypes type, Customer customer, List<ItemSale> itemSaleList) {
        this.id = id;
        this.type = validateType(type);
        this.date = LocalDateTime.now();
        this.customer = validateCustomer(customer);
        this.itemSaleList = validateItemSaleList(itemSaleList);
    }

    public Sale(SaleTypes type, Customer customer, List<ItemSale> itemSaleList){
        this.type = validateType(type);
        this.date = LocalDateTime.now();
        this.customer = validateCustomer(customer);
        this.itemSaleList = validateItemSaleList(itemSaleList);
    }

    public Sale(SaleTypes type, Customer customer){
        this.type = validateType(type);
        this.date = LocalDateTime.now();
        this.customer = validateCustomer(customer);
    }

    public Sale(Long id, SaleTypes type, Customer customer, List<ItemSale> itemSaleList, LocalDateTime date){
        this.id = id;
        this.type = validateType(type);
        this.customer = validateCustomer(customer);
        this.itemSaleList = validateItemSaleList(itemSaleList);
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public SaleTypes getType() {
        return type;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public Customer getCustomer() {
        return customer;
    }

    public List<ItemSale> getItemSaleList() {
        return this.itemSaleList;
    }

    public void setItemSaleList(List<ItemSale> itemSaleList) {
        this.itemSaleList = validateItemSaleList(itemSaleList);
    }

    public BigDecimal calcTotalPrice(){
        BigDecimal total = BigDecimal.ZERO;
        for(ItemSale itemSale : this.itemSaleList){
            total = total.add(itemSale.calcSubtotalPrice());
        }
        return total;
    }

    private SaleTypes validateType(SaleTypes type){
        if(type == null){
            throw new IllegalArgumentException("Debe ingresar el tipo de venta!");
        }
        return type;
    }

    private Customer validateCustomer(Customer customer){
        if(customer == null){
            throw new IllegalArgumentException("Debe ingresar el cliente asociado a la venta!");
        }
        return customer;
    }

    private List<ItemSale> validateItemSaleList(List<ItemSale> itemSaleList){
        if(itemSaleList == null || itemSaleList.isEmpty()){
            throw new IllegalArgumentException("Debe agregar articulos a la venta!");
        }
        return itemSaleList;
    }
}
