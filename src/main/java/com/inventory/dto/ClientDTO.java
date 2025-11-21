package com.inventory.dto;

import com.inventory.model.Client;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ClientDTO {
    private Long id;
    private String name;
    private String contactPhone;
    private String contactEmail;
    private String address;
    private Boolean isCreditClient;
    private BigDecimal creditLimit;
    private String currentMonthStatus;

    public static ClientDTO fromEntity(Client client) {
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setContactPhone(client.getContactPhone());
        dto.setContactEmail(client.getContactEmail());
        dto.setAddress(client.getAddress());
        dto.setIsCreditClient(client.getIsCreditClient());
        dto.setCreditLimit(client.getCreditLimit());
        dto.setCurrentMonthStatus(client.getCurrentMonthStatus());
        return dto;
    }
}
