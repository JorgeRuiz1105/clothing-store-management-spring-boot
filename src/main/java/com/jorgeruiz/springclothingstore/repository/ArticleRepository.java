package com.jorgeruiz.springclothingstore.repository;

import com.jorgeruiz.springclothingstore.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

}
