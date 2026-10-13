package com.jorgeruiz.springclothingstore.service;

import com.jorgeruiz.springclothingstore.exception.EntityNotFoundException;
import com.jorgeruiz.springclothingstore.exception.InsufficientStockException;
import com.jorgeruiz.springclothingstore.model.*;
import com.jorgeruiz.springclothingstore.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SaleServiceImpl implements SaleService{

    private final SaleRepository saleRepository;
    private final ArticleService articleService;
    private final CustomerService customerService;
    private final DebtService debtService;

    @Autowired
    public SaleServiceImpl(SaleRepository saleRepository, ArticleService articleService, CustomerService customerService, DebtService debtService) {
        this.saleRepository = saleRepository;
        this.articleService = articleService;
        this.customerService = customerService;
        this.debtService = debtService;
    }

    @Transactional
    @Override
    public Sale saveSale(SaleTypes type, String document, Map<Long, Integer> items) {
        if(items == null || items.isEmpty()){
            throw new IllegalArgumentException("La lista de items está vacia!");
        }

        Customer customer = customerService.getCustomerByDocument(document);

        Sale sale = new Sale(type, customer);
        List<ItemSale> itemSaleList = new ArrayList<>();

        for(Map.Entry<Long, Integer> entry : items.entrySet()){
            Long articleId = entry.getKey();
            int articleAmount = entry.getValue();

            Article article = articleService.getArticleById(articleId);

            if(!article.hasEnoughStock(articleAmount)){
                throw new InsufficientStockException("No hay suficiente stock para: " + article.getName());
            }

            ItemSale itemSale = new ItemSale(article, articleAmount, article.getPrice());

            itemSale.setSale(sale);

            itemSaleList.add(itemSale);
        }

        sale.setItemSaleList(itemSaleList);

        for(ItemSale itemSale : itemSaleList){
            articleService.inventoryOutflow(itemSale.getArticle().getId(), itemSale.getAmount());
        }

        Sale savedSale = saleRepository.save(sale);

        if(type == SaleTypes.FIADA){
            debtService.saveDebt(new Debt(customer, savedSale));
        }

        return savedSale;
    }

    @Override
    public Sale getSaleById(Long id) {
        return saleRepository.findById(id).orElseThrow(()
                -> new EntityNotFoundException("No se encontró la venta con ID: " + id));
    }

    @Override
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
}
