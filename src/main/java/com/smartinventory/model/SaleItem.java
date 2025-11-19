package com.smartinventory.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(SaleItem.SaleItemId.class)
public class SaleItem {

    @Id
    @Column(name = "sale_id", nullable = false)
    private Long saleId;

    @Id
    @Column(name = "stock_id", nullable = false)
    private Long stockId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", insertable = false, updatable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", insertable = false, updatable = false)
    private Stock stock;

    @Column(name = "quantity_sold", nullable = false)
    private Integer quantitySold;

    @Column(name = "unit_price_at_sale", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceAtSale;

    // Composite Primary Key Class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItemId implements Serializable {
        private Long saleId;
        private Long stockId;
    }
}
