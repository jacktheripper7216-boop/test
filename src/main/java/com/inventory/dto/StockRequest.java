package com.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StockRequest {
    private Long productId;
    private Long supplierId;
    private String location;
    private Integer quantity;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Long depositedByUserId;
    private String expirationDate;
}
