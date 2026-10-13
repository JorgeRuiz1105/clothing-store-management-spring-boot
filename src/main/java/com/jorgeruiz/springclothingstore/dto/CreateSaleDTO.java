package com.jorgeruiz.springclothingstore.dto;

import com.jorgeruiz.springclothingstore.model.SaleTypes;

import java.util.Map;

public record CreateSaleDTO(
        SaleTypes type,
        String customerDocument,
        Map<Long, Integer> items
) {
}
