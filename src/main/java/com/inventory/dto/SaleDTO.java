package com.inventory.dto;

import com.inventory.model.Sale;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SaleDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long userId;
    private String salespersonName;
    private LocalDateTime saleDate;
    private BigDecimal totalAmount;
    private BigDecimal discountApplied;
    private String paymentMethod;
    private List<SaleItemDTO> items;

    public static SaleDTO fromEntity(Sale sale) {
        SaleDTO dto = new SaleDTO();
        dto.setId(sale.getId());
        dto.setClientId(sale.getClientId());
        dto.setUserId(sale.getUserId());
        dto.setSaleDate(sale.getSaleDate());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setDiscountApplied(sale.getDiscountApplied());
        dto.setPaymentMethod(sale.getPaymentMethod());

        if (sale.getClient() != null) {
            dto.setClientName(sale.getClient().getName());
        }
        if (sale.getSalesperson() != null) {
            dto.setSalespersonName(sale.getSalesperson().getFullName());
        }
        if (sale.getSaleItems() != null) {
            dto.setItems(sale.getSaleItems().stream()
                    .map(SaleItemDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
