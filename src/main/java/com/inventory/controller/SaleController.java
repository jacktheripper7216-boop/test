package com.inventory.controller;

import com.inventory.model.Sale;
import com.inventory.repository.SaleRepository;
import com.inventory.repository.ClientRepository;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleRepository saleRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        List<Sale> sales = saleRepository.findAll();
        // Avoid circular references
        sales.forEach(s -> {
            if (s.getClient() != null) s.getClient().setSales(null);
            if (s.getSalesperson() != null) s.getSalesperson().setAuthDetails(null);
            s.setSaleItems(null);
        });
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSaleById(@PathVariable Long id) {
        return saleRepository.findById(id)
                .map(sale -> {
                    if (sale.getClient() != null) sale.getClient().setSales(null);
                    if (sale.getSalesperson() != null) sale.getSalesperson().setAuthDetails(null);
                    sale.setSaleItems(null);
                    return ResponseEntity.ok(sale);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Sale>> getSalesByClient(@PathVariable Long clientId) {
        List<Sale> sales = saleRepository.findByClientId(clientId);
        sales.forEach(s -> {
            if (s.getClient() != null) s.getClient().setSales(null);
            if (s.getSalesperson() != null) s.getSalesperson().setAuthDetails(null);
            s.setSaleItems(null);
        });
        return ResponseEntity.ok(sales);
    }

    @PostMapping
    public ResponseEntity<Object> createSale(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        Long clientId = request.get("client_id") != null
                ? Long.valueOf(request.get("client_id").toString())
                : null;
        Long userId = request.get("user_id") != null
                ? Long.valueOf(request.get("user_id").toString())
                : null;

        if (clientId == null || userId == null) {
            response.put("message", "client_id and user_id are required");
            return ResponseEntity.badRequest().body(response);
        }

        if (!clientRepository.existsById(clientId)) {
            response.put("message", "Client with ID " + clientId + " not found");
            return ResponseEntity.badRequest().body(response);
        }

        if (!userRepository.existsById(userId)) {
            response.put("message", "User with ID " + userId + " not found");
            return ResponseEntity.badRequest().body(response);
        }

        Sale sale = new Sale();
        sale.setClientId(clientId);
        sale.setUserId(userId);
        sale.setSaleDate(LocalDateTime.now());

        if (request.get("total_amount") != null) {
            sale.setTotalAmount(new BigDecimal(request.get("total_amount").toString()));
        } else {
            sale.setTotalAmount(BigDecimal.ZERO);
        }

        if (request.get("discount_applied") != null) {
            sale.setDiscountApplied(new BigDecimal(request.get("discount_applied").toString()));
        }

        sale.setPaymentMethod((String) request.getOrDefault("payment_method", "Cash"));

        sale = saleRepository.save(sale);

        // Clear circular references
        if (sale.getClient() != null) sale.getClient().setSales(null);
        if (sale.getSalesperson() != null) sale.getSalesperson().setAuthDetails(null);
        sale.setSaleItems(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(sale);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateSale(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        return saleRepository.findById(id)
                .map(sale -> {
                    if (request.containsKey("client_id")) {
                        Long clientId = Long.valueOf(request.get("client_id").toString());
                        if (!clientRepository.existsById(clientId)) {
                            response.put("message", "Client with ID " + clientId + " not found");
                            return ResponseEntity.badRequest().body((Object) response);
                        }
                        sale.setClientId(clientId);
                    }
                    if (request.containsKey("user_id")) {
                        Long userId = Long.valueOf(request.get("user_id").toString());
                        if (!userRepository.existsById(userId)) {
                            response.put("message", "User with ID " + userId + " not found");
                            return ResponseEntity.badRequest().body((Object) response);
                        }
                        sale.setUserId(userId);
                    }
                    if (request.containsKey("total_amount")) {
                        sale.setTotalAmount(new BigDecimal(request.get("total_amount").toString()));
                    }
                    if (request.containsKey("discount_applied")) {
                        Object discount = request.get("discount_applied");
                        if (discount != null) {
                            sale.setDiscountApplied(new BigDecimal(discount.toString()));
                        } else {
                            sale.setDiscountApplied(null);
                        }
                    }
                    if (request.containsKey("payment_method")) {
                        sale.setPaymentMethod((String) request.get("payment_method"));
                    }

                    saleRepository.save(sale);

                    // Clear circular references
                    if (sale.getClient() != null) sale.getClient().setSales(null);
                    if (sale.getSalesperson() != null) sale.getSalesperson().setAuthDetails(null);
                    sale.setSaleItems(null);

                    return ResponseEntity.ok((Object) sale);
                })
                .orElseGet(() -> {
                    response.put("message", "Sale not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteSale(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        return saleRepository.findById(id)
                .map(sale -> {
                    saleRepository.delete(sale);
                    response.put("message", "Sale deleted successfully");
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).body((Object) response);
                })
                .orElseGet(() -> {
                    response.put("message", "Sale not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
