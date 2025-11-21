package com.inventory.dto;

import com.inventory.model.SaleItem;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SaleItemDTO {
    private Long saleId;
    private Long stockId;
    private String productName;
    private Integer quantitySold;
    private BigDecimal unitPriceAtSale;
    private BigDecimal subtotal;

    public static SaleItemDTO fromEntity(SaleItem item) {
        SaleItemDTO dto = new SaleItemDTO();
        dto.setSaleId(item.getSaleId());
        dto.setStockId(item.getStockId());
        dto.setQuantitySold(item.getQuantitySold());
        dto.setUnitPriceAtSale(item.getUnitPriceAtSale());
        dto.setSubtotal(item.getUnitPriceAtSale().multiply(BigDecimal.valueOf(item.getQuantitySold())));

        if (item.getStockItem() != null && item.getStockItem().getProduct() != null) {
            dto.setProductName(item.getStockItem().getProduct().getName());
        }
        return dto;
    }
}
