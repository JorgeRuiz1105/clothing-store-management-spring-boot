package com.jorgeruiz.springclothingstore.model;

import java.util.List;

public enum ArticleCategories {
    ROPA(List.of(
            "XS", "S", "M", "L", "XL", "XXL",
            "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40"
    )),

    CALZADO(List.of(
            "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
    )),

    BEBES(List.of(
            "0-3M", "3-6M", "6-12M", "2T", "4T"
    ));

    private final List<String> validSizes;

    ArticleCategories(List<String> validSizes) {
        this.validSizes = validSizes;
    }

    public boolean isValidSize(String size) {
        if (size == null || size.isBlank()) {
            return false;
        }

        return validSizes.contains(size.trim().toUpperCase());
    }
}
