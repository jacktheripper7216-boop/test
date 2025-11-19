package com.inventory.repository;

import com.inventory.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByProductId(Long productId);
    List<Stock> findBySupplierId(Long supplierId);
}
