package com.jorgeruiz.springclothingstore.controller;

import com.jorgeruiz.springclothingstore.dto.CreateSaleDTO;
import com.jorgeruiz.springclothingstore.model.Sale;
import com.jorgeruiz.springclothingstore.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/sales")
public class SaleController {
    private final SaleService saleService;

    @Autowired
    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(@RequestBody CreateSaleDTO request){
        Sale savedSale = saleService.saveSale(
                request.type(),
                request.customerDocument(),
                request.items()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSale);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(@PathVariable Long id){
        Sale sale = saleService.getSaleById(id);
        return ResponseEntity.ok(sale);
    }

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales(){
        List<Sale> sales = saleService.getAllSales();
        return ResponseEntity.ok(sales);
    }
}
