package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.model.Article;
import com.jorgeruiz.springclothingstore.model.ArticleCategories;

import java.math.BigDecimal;
import java.util.List;

public interface ArticleService {
    Article saveArticle(Article article);

    Article getArticleById(Long id);

    List<Article> getAllArticles();

    Article updateArticle(Long id, String name, String size, String color, BigDecimal price, ArticleCategories category);

    void deleteArticleById(Long id);

    void inventoryIntake(Long id, int quantity);

    void inventoryOutflow(Long id, int quantity);
}
