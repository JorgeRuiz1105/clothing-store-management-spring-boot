package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.model.Sale;
import com.jorgeruiz.springclothingstore.model.SaleTypes;

import java.util.List;
import java.util.Map;

public interface SaleService {
    Sale saveSale(SaleTypes type, String document, Map<Long, Integer> items);

    Sale getSaleById(Long id);

    List<Sale> getAllSales();
}
