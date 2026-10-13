package com.jorgeruiz.springclothingstore.dto;

public record CustomerDTO(
        Long id,
        String document,
        String name,
        String phone,
        String address
) {
}
