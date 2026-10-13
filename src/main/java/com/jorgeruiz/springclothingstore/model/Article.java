package com.jorgeruiz.springclothingstore.model;

import com.jorgeruiz.springclothingstore.exception.InsufficientStockException;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "article")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "size", nullable = false, length = 10)
    private String size;

    @Column(name = "color", nullable = false)
    private String color;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ArticleCategories category;

    public Article(){

    }

    public Article(Long id, String name, String size, String color, BigDecimal price, int quantity, ArticleCategories category) {
        this.id = id;
        this.name = validateName(name);
        this.size = size;
        this.color = validateColor(color);
        this.price = validatePrice(price);
        this.quantity = validateQuantity(quantity);
        this.category = category;
    }

    public Article(String name, String size, String color, BigDecimal price, int quantity, ArticleCategories category){
        this.name = validateName(name);
        this.size = size;
        this.color = validateColor(color);
        this.price = validatePrice(price);
        this.quantity = validateQuantity(quantity);
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = validateName(name);
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        if(!this.category.isValidSize(size)){
            throw new IllegalArgumentException("La talla " + size + " no corresponde a la categoria!");
        }
        this.size = size.trim().toUpperCase();
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = validateColor(color);
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        if(price == null || price.compareTo(BigDecimal.ZERO) < 0){
            throw new IllegalArgumentException("Ha introducido un valor de precio invalido!");
        }
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void reduceQuantity(int quantity){
        if(quantity <= 0){
            throw new IllegalArgumentException("La cantidad a reducir debe ser mayor a 0!");
        }
        if(this.quantity < quantity){
            throw new InsufficientStockException("Stock insuficiente en el inventario!");
        }
        this.quantity -= quantity;
    }

    public void addQuantity(int quantity){
        if(quantity <= 0){
            throw new IllegalArgumentException("La cantidad a agregar debe ser mayor a 0!");
        }
        this.quantity += quantity;
    }

    public boolean hasEnoughStock(int quantity){
        return this.quantity >= quantity;
    }

    public ArticleCategories getCategory() {
        return category;
    }

    public void setCategory(ArticleCategories category) {
        if(!category.isValidSize(this.size)){
            throw new IllegalArgumentException("La categoria nueva no soporta la talla actual del articulo!");
        }
        this.category = category;
    }

    //auxiliar method to modify the article from the store
    public void updateSizeAndCategory(String size, ArticleCategories category){
        this.category = category;
        this.size = size;
    }

    private String validateName(String name){
        if(name == null || name.isBlank()){
            throw new IllegalArgumentException("Debe ingresar el nombre del artículo!");
        }
        return name;
    }

    private String validateColor(String color){
        if(color == null || color.isBlank()){
            throw new IllegalArgumentException("Debe ingresar el color del artículo!");
        }
        return color;
    }

    private BigDecimal validatePrice(BigDecimal price){
        if(price == null || price.compareTo(BigDecimal.ZERO) < 0){
            throw new IllegalArgumentException("Ha introducido un valor de precio invalido!");
        }
        return price;
    }

    private int validateQuantity(int quantity){
        if(quantity < 0){
            throw new IllegalArgumentException("La cantidad por articulo debe ser mayor o igual 0!");
        }
        return quantity;
    }
}
