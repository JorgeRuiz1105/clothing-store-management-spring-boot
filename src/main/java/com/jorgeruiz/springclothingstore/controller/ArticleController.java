package com.jorgeruiz.springclothingstore.controller;

import com.jorgeruiz.springclothingstore.dto.ArticleDTO;
import com.jorgeruiz.springclothingstore.model.Article;
import com.jorgeruiz.springclothingstore.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {
    private final ArticleService articleService;

    @Autowired
    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @PostMapping
    public ResponseEntity<Article> createArticle(@RequestBody ArticleDTO request){
        Article newArticle = new Article(
                request.id(),
                request.name(),
                request.size(),
                request.color(),
                request.price(),
                request.quantity(),
                request.category()
        );
        Article savedArticle = articleService.saveArticle(newArticle);
        return new ResponseEntity<>(savedArticle, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable Long id){
        Article article = articleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }

    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles(){
        List<Article> articles = articleService.getAllArticles();
        return ResponseEntity.ok(articles);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id){
        articleService.deleteArticleById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @RequestBody ArticleDTO request){
        Article updatedArticle = articleService.updateArticle(
                id,
                request.name(),
                request.size(),
                request.color(),
                request.price(),
                request.category()
        );
        return ResponseEntity.ok(updatedArticle);
    }

    @PatchMapping("/{id}/intake")
    public ResponseEntity<Void> inventoryIntake(@PathVariable Long id, @RequestBody Map<String, Integer> payload){
        int quantity = payload.get("quantity");
        articleService.inventoryIntake(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/outflow")
    public ResponseEntity<Void> inventoryOutflow(@PathVariable Long id, @RequestBody Map<String, Integer> payload){
        int quantity = payload.get("quantity");
        articleService.inventoryOutflow(id, quantity);
        return ResponseEntity.ok().build();
    }

}
