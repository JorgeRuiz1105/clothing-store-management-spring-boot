package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.model.Article;

import java.util.List;

public interface ArticleService {
    Article saveArticle(Article article);

    Article getArticleById(Long id);

    List<Article> getAllArticles();

    void deleteArticleById(Long id);

    void inventoryIntake(Long id, int quantity);

    void inventoryOutflow(Long id, int quantity);
}
