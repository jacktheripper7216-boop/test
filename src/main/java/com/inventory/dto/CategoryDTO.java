package com.inventory.dto;

import com.inventory.model.Category;
import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;

    public static CategoryDTO fromEntity(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        return dto;
    }
}
