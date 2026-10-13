package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.exception.EntityNotFoundException;
import com.jorgeruiz.springclothingstore.model.Article;
import com.jorgeruiz.springclothingstore.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArticleServiceImpl implements ArticleService{

    private final ArticleRepository articleRepository;

    @Autowired
    public ArticleServiceImpl(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Transactional
    @Override
    public Article saveArticle(Article article) {
        if(article == null){
            throw new IllegalArgumentException("El articulo no puede ser nulo!");
        }
        return articleRepository.save(article);
    }

    @Override
    public Article getArticleById(Long id) {
        return articleRepository.findById(id).orElseThrow(()
                -> new EntityNotFoundException("No se encontró el articulo con ID: " + id));
    }

    @Override
    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    @Transactional
    @Override
    public void deleteArticleById(Long id) {
        getArticleById(id);
        articleRepository.deleteById(id);
    }

    @Transactional
    @Override
    public void inventoryIntake(Long id, int quantity) {
        Article article = getArticleById(id);
        article.addQuantity(quantity);
        articleRepository.save(article);
    }

    @Transactional
    @Override
    public void inventoryOutflow(Long id, int quantity) {
        Article article = getArticleById(id);
        article.reduceQuantity(quantity);
        articleRepository.save(article);
    }
}
