package com.inventory.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_item")
@IdClass(SaleItemId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleItem {

    @Id
    @Column(name = "sale_id")
    private Long saleId;

    @Id
    @Column(name = "stock_id")
    private Long stockId;

    @Column(name = "quantity_sold", nullable = false)
    private Integer quantitySold;

    @Column(name = "unit_price_at_sale", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceAtSale;

    @ManyToOne
    @JoinColumn(name = "sale_id", insertable = false, updatable = false)
    private Sale sale;

    @ManyToOne
    @JoinColumn(name = "stock_id", insertable = false, updatable = false)
    private Stock stockItem;
}
