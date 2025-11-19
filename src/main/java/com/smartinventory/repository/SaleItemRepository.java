package com.smartinventory.repository;

import com.smartinventory.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, SaleItem.SaleItemId> {
}
