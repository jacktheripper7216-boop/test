package com.inventory.dto;

import com.inventory.model.Supplier;
import lombok.Data;

@Data
public class SupplierDTO {
    private Long id;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String additionalFees;

    public static SupplierDTO fromEntity(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setAddress(supplier.getAddress());
        if (supplier.getAdditionalFees() != null) {
            dto.setAdditionalFees(supplier.getAdditionalFees().toString());
        }
        return dto;
    }
}
