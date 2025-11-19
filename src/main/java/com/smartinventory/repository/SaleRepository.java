package com.smartinventory.repository;

import com.smartinventory.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByClientId(Long clientId);
    List<Sale> findByUserId(Long userId);
}
