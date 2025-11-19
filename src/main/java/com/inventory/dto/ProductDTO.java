package com.inventory.dto;

import com.inventory.model.Product;
import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String brand;
    private String description;
    private Integer warrantyMonths;
    private Long categoryId;
    private String categoryName;

    public static ProductDTO fromEntity(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setDescription(product.getDescription());
        dto.setWarrantyMonths(product.getWarrantyMonths());
        dto.setCategoryId(product.getCategoryId());
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }
        return dto;
    }
}
