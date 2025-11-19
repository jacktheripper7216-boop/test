package com.inventory.dto;

import com.inventory.model.Stock;
import lombok.Data;

@Data
public class StockDTO {
    private Long id;
    private Long productId;
    private Long supplierId;
    private String location;
    private Integer quantity;
    private String costPrice;
    private String sellingPrice;
    private Long depositedByUserId;
    private String depositedAt;
    private String expirationDate;
    private String productName;
    private String supplierName;
    private String depositorUsername;

    public static StockDTO fromEntity(Stock stock) {
        StockDTO dto = new StockDTO();
        dto.setId(stock.getId());
        dto.setProductId(stock.getProductId());
        dto.setSupplierId(stock.getSupplierId());
        dto.setLocation(stock.getLocation());
        dto.setQuantity(stock.getQuantity());
        if (stock.getCostPrice() != null) {
            dto.setCostPrice(stock.getCostPrice().toString());
        }
        dto.setSellingPrice(stock.getSellingPrice().toString());
        dto.setDepositedByUserId(stock.getDepositedByUserId());
        if (stock.getDepositedAt() != null) {
            dto.setDepositedAt(stock.getDepositedAt().toString());
        }
        if (stock.getExpirationDate() != null) {
            dto.setExpirationDate(stock.getExpirationDate().toString());
        }
        if (stock.getProduct() != null) {
            dto.setProductName(stock.getProduct().getName());
        }
        if (stock.getSupplier() != null) {
            dto.setSupplierName(stock.getSupplier().getName());
        }
        if (stock.getDepositor() != null) {
            dto.setDepositorUsername(stock.getDepositor().getUsername());
        }
        return dto;
    }
}
