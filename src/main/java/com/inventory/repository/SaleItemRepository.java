package com.inventory.repository;

import com.inventory.model.SaleItem;
import com.inventory.model.SaleItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, SaleItemId> {
}
