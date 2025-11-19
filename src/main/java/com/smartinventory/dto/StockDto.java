package com.smartinventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDto {
    private Long id;
    private Long productId;
    private Long supplierId;
    private String location;
    private Integer quantity;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Long depositedByUserId;
    private LocalDateTime depositedAt;
    private LocalDate expirationDate;
    private String productName;
    private String supplierName;
    private String depositorUsername;
}
