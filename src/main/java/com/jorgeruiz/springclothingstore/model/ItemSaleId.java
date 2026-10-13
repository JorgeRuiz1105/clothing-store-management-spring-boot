package com.jorgeruiz.springclothingstore.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ItemSaleId implements Serializable {
    private Long saleId;
    private Long articleId;

    public ItemSaleId(){

    }

    public ItemSaleId(Long saleId, Long articleId) {
        this.saleId = saleId;
        this.articleId = articleId;
    }

    public Long getSaleId() {
        return saleId;
    }

    public void setSaleId(Long saleId) {
        this.saleId = saleId;
    }

    public Long getArticleId() {
        return articleId;
    }

    public void setArticleId(Long articleId) {
        this.articleId = articleId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ItemSaleId that = (ItemSaleId) o;
        return Objects.equals(saleId, that.saleId) && Objects.equals(articleId, that.articleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(saleId, articleId);
    }
}
