package com.jorgeruiz.springclothingstore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "item_sale")
public class ItemSale {
    @EmbeddedId
    private ItemSaleId id = new ItemSaleId();

    @ManyToOne
    @MapsId("saleId")
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnore
    private Sale sale;

    @ManyToOne
    @MapsId("articleId")
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "amount", nullable = false)
    private int amount;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    public ItemSale(){

    }

    public ItemSale(Sale sale, Article article, int amount, BigDecimal unitPrice) {
        this.sale = validateSale(sale);
        this.article = validateArticle(article);
        this.amount = validateAmount(amount);
        this.unitPrice = validateUnitPrice(unitPrice);
    }

    public ItemSale(Article article, int amount, BigDecimal unitPrice) {
        this.article = validateArticle(article);
        this.amount = validateAmount(amount);
        this.unitPrice = validateUnitPrice(unitPrice);
    }

    public Sale getSale() {
        return sale;
    }

    public void setSale(Sale sale) {
        this.sale = validateSale(sale);
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = validateArticle(article);
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = validateAmount(amount);
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = validateUnitPrice(unitPrice);
    }

    public BigDecimal calcSubtotalPrice(){
        return this.unitPrice.multiply(BigDecimal.valueOf(this.amount));
    }

    private Article validateArticle(Article article){
        if(article == null){
            throw new IllegalArgumentException("Debe especificar el artículo a añadir!");
        }
        return article;
    }

    private Sale validateSale(Sale sale){
        if(sale == null){
            throw new IllegalArgumentException("Debe especificar la venta!");
        }
        return sale;
    }

    private int validateAmount(int amount){
        if(amount <= 0){
            throw new IllegalArgumentException("La cantidad por articulo debe ser mayor a 0!");
        }
        return amount;
    }

    private BigDecimal validateUnitPrice(BigDecimal unitPrice){
        if(unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0){
            throw new IllegalArgumentException("Se ha introducido un valor de precio unitario invalido!");
        }
        return unitPrice;
    }
}
