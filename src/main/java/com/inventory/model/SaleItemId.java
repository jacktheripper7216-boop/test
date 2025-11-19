package com.inventory.model;

import java.io.Serializable;
import java.util.Objects;

public class SaleItemId implements Serializable {

    private Long saleId;
    private Long stockId;

    public SaleItemId() {}

    public SaleItemId(Long saleId, Long stockId) {
        this.saleId = saleId;
        this.stockId = stockId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SaleItemId that = (SaleItemId) o;
        return Objects.equals(saleId, that.saleId) && Objects.equals(stockId, that.stockId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(saleId, stockId);
    }
}
