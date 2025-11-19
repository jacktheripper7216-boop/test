package com.inventory.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "supplier")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "contact_person", length = 255)
    private String contactPerson;

    @Column(length = 20)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "additional_fees", precision = 10, scale = 2)
    private BigDecimal additionalFees;

    @OneToMany(mappedBy = "supplier")
    private List<Stock> stocks;
}
