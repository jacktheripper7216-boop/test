package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.SupplierDto;
import com.smartinventory.model.Supplier;
import com.smartinventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<List<SupplierDto>> getAllSuppliers() {
        List<SupplierDto> suppliers = supplierRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierById(@PathVariable Long id) {
        return supplierRepository.findById(id)
                .map(supplier -> ResponseEntity.ok(convertToDto(supplier)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @PostMapping
    public ResponseEntity<?> createSupplier(@RequestBody SupplierDto supplierDto) {
        if (supplierDto.getName() == null || supplierDto.getName().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse("Supplier name is required"));
        }

        Supplier supplier = new Supplier();
        supplier.setName(supplierDto.getName());
        supplier.setContactPerson(supplierDto.getContactPerson());
        supplier.setPhone(supplierDto.getPhone());
        supplier.setEmail(supplierDto.getEmail());
        supplier.setAddress(supplierDto.getAddress());
        supplier.setAdditionalFees(supplierDto.getAdditionalFees());

        Supplier savedSupplier = supplierRepository.save(supplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedSupplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @RequestBody SupplierDto supplierDto) {
        return supplierRepository.findById(id)
                .map(supplier -> {
                    if (supplierDto.getName() != null) {
                        supplier.setName(supplierDto.getName());
                    }
                    if (supplierDto.getContactPerson() != null) {
                        supplier.setContactPerson(supplierDto.getContactPerson());
                    }
                    if (supplierDto.getPhone() != null) {
                        supplier.setPhone(supplierDto.getPhone());
                    }
                    if (supplierDto.getEmail() != null) {
                        supplier.setEmail(supplierDto.getEmail());
                    }
                    if (supplierDto.getAddress() != null) {
                        supplier.setAddress(supplierDto.getAddress());
                    }
                    if (supplierDto.getAdditionalFees() != null) {
                        supplier.setAdditionalFees(supplierDto.getAdditionalFees());
                    }
                    Supplier updatedSupplier = supplierRepository.save(supplier);
                    return ResponseEntity.ok(convertToDto(updatedSupplier));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        if (!supplierRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse("Supplier not found"));
        }
        supplierRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse("Supplier deleted successfully"));
    }

    private SupplierDto convertToDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setAddress(supplier.getAddress());
        dto.setAdditionalFees(supplier.getAdditionalFees());
        return dto;
    }
}
