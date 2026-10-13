package com.jorgeruiz.springclothingstore.dto;

import com.jorgeruiz.springclothingstore.model.ArticleCategories;

import java.math.BigDecimal;

public record ArticleDTO(
    Long id,
    String name,
    String size,
    String color,
    BigDecimal price,
    int quantity,
    ArticleCategories category
) {
}
