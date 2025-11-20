package com.inventory.controller;

import com.inventory.dto.SupplierDTO;
import com.inventory.model.Supplier;
import com.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        List<SupplierDTO> suppliers = supplierRepository.findAll()
                .stream()
                .map(SupplierDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierById(@PathVariable Long id) {
        return supplierRepository.findById(id)
                .map(supplier -> ResponseEntity.ok(SupplierDTO.fromEntity(supplier)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @PostMapping
    public ResponseEntity<Object> createSupplier(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        String name = (String) request.get("name");

        if (name == null || name.isEmpty()) {
            response.put("message", "Supplier name is required");
            return ResponseEntity.badRequest().body(response);
        }

        Supplier supplier = new Supplier();
        supplier.setName(name);
        supplier.setContactPerson((String) request.get("contact_person"));
        supplier.setPhone((String) request.get("phone"));
        supplier.setEmail((String) request.get("email"));
        supplier.setAddress((String) request.get("address"));
        if (request.get("additional_fees") != null) {
            supplier.setAdditionalFees(new BigDecimal(request.get("additional_fees").toString()));
        }
        supplier = supplierRepository.save(supplier);

        return ResponseEntity.status(HttpStatus.CREATED).body(SupplierDTO.fromEntity(supplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateSupplier(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        return supplierRepository.findById(id)
                .map(supplier -> {
                    if (request.containsKey("name")) {
                        supplier.setName((String) request.get("name"));
                    }
                    if (request.containsKey("contact_person")) {
                        supplier.setContactPerson((String) request.get("contact_person"));
                    }
                    if (request.containsKey("phone")) {
                        supplier.setPhone((String) request.get("phone"));
                    }
                    if (request.containsKey("email")) {
                        supplier.setEmail((String) request.get("email"));
                    }
                    if (request.containsKey("address")) {
                        supplier.setAddress((String) request.get("address"));
                    }
                    if (request.containsKey("additional_fees")) {
                        supplier.setAdditionalFees(new BigDecimal(request.get("additional_fees").toString()));
                    }
                    supplierRepository.save(supplier);
                    return ResponseEntity.ok((Object) SupplierDTO.fromEntity(supplier));
                })
                .orElseGet(() -> {
                    response.put("message", "Supplier not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteSupplier(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        return supplierRepository.findById(id)
                .map(supplier -> {
                    supplierRepository.delete(supplier);
                    response.put("message", "Supplier deleted successfully");
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).body((Object) response);
                })
                .orElseGet(() -> {
                    response.put("message", "Supplier not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
