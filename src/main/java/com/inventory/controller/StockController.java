package com.inventory.controller;

import com.inventory.dto.StockDTO;
import com.inventory.model.Stock;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockRepository;
import com.inventory.repository.SupplierRepository;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<StockDTO>> getAllStocks() {
        List<StockDTO> stocks = stockRepository.findAll()
                .stream()
                .map(StockDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStockById(@PathVariable Long id) {
        return stockRepository.findById(id)
                .map(stock -> ResponseEntity.ok(StockDTO.fromEntity(stock)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @PostMapping
    public ResponseEntity<Object> createStock(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        // Validate required fields
        String[] requiredFields = {"product_id", "supplier_id", "quantity", "selling_price", "deposited_by_user_id"};
        for (String field : requiredFields) {
            if (!request.containsKey(field)) {
                response.put("message", "Missing required fields: product_id, supplier_id, quantity, selling_price, deposited_by_user_id");
                return ResponseEntity.badRequest().body(response);
            }
        }

        Long productId = Long.valueOf(request.get("product_id").toString());
        Long supplierId = Long.valueOf(request.get("supplier_id").toString());
        Long depositedByUserId = Long.valueOf(request.get("deposited_by_user_id").toString());

        // Validate foreign keys
        if (!productRepository.existsById(productId)) {
            response.put("message", "Product with ID " + productId + " not found.");
            return ResponseEntity.badRequest().body(response);
        }
        if (!supplierRepository.existsById(supplierId)) {
            response.put("message", "Supplier with ID " + supplierId + " not found.");
            return ResponseEntity.badRequest().body(response);
        }
        if (!userRepository.existsById(depositedByUserId)) {
            response.put("message", "User with ID " + depositedByUserId + " not found.");
            return ResponseEntity.badRequest().body(response);
        }

        // Parse expiration date if provided
        LocalDate expirationDate = null;
        if (request.get("expiration_date") != null) {
            try {
                expirationDate = LocalDate.parse(request.get("expiration_date").toString(),
                        DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (DateTimeParseException e) {
                response.put("message", "Invalid date format for expiration_date. Use YYYY-MM-DD.");
                return ResponseEntity.badRequest().body(response);
            }
        }

        Stock stock = new Stock();
        stock.setProductId(productId);
        stock.setSupplierId(supplierId);
        stock.setQuantity(Integer.valueOf(request.get("quantity").toString()));
        stock.setSellingPrice(new BigDecimal(request.get("selling_price").toString()));
        stock.setDepositedByUserId(depositedByUserId);
        stock.setLocation((String) request.get("location"));
        if (request.get("cost_price") != null) {
            stock.setCostPrice(new BigDecimal(request.get("cost_price").toString()));
        }
        stock.setExpirationDate(expirationDate);

        stock = stockRepository.save(stock);

        return ResponseEntity.status(HttpStatus.CREATED).body(StockDTO.fromEntity(stock));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateStock(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        return stockRepository.findById(id)
                .map(stock -> {
                    // Validate foreign key updates
                    if (request.containsKey("product_id")) {
                        Long productId = Long.valueOf(request.get("product_id").toString());
                        if (!productRepository.existsById(productId)) {
                            response.put("message", "Product with ID " + productId + " not found.");
                            return ResponseEntity.badRequest().body((Object) response);
                        }
                        stock.setProductId(productId);
                    }
                    if (request.containsKey("supplier_id")) {
                        Long supplierId = Long.valueOf(request.get("supplier_id").toString());
                        if (!supplierRepository.existsById(supplierId)) {
                            response.put("message", "Supplier with ID " + supplierId + " not found.");
                            return ResponseEntity.badRequest().body((Object) response);
                        }
                        stock.setSupplierId(supplierId);
                    }
                    if (request.containsKey("deposited_by_user_id")) {
                        Long userId = Long.valueOf(request.get("deposited_by_user_id").toString());
                        if (!userRepository.existsById(userId)) {
                            response.put("message", "User with ID " + userId + " not found.");
                            return ResponseEntity.badRequest().body((Object) response);
                        }
                        stock.setDepositedByUserId(userId);
                    }

                    // Update other fields
                    if (request.containsKey("quantity")) {
                        stock.setQuantity(Integer.valueOf(request.get("quantity").toString()));
                    }
                    if (request.containsKey("selling_price")) {
                        stock.setSellingPrice(new BigDecimal(request.get("selling_price").toString()));
                    }
                    if (request.containsKey("location")) {
                        stock.setLocation((String) request.get("location"));
                    }
                    if (request.containsKey("cost_price")) {
                        stock.setCostPrice(new BigDecimal(request.get("cost_price").toString()));
                    }
                    if (request.containsKey("expiration_date")) {
                        stock.setExpirationDate(LocalDate.parse(request.get("expiration_date").toString()));
                    }

                    stockRepository.save(stock);
                    return ResponseEntity.ok((Object) StockDTO.fromEntity(stock));
                })
                .orElseGet(() -> {
                    response.put("message", "Stock item not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteStock(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        return stockRepository.findById(id)
                .map(stock -> {
                    stockRepository.delete(stock);
                    response.put("message", "Stock item deleted successfully");
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).body((Object) response);
                })
                .orElseGet(() -> {
                    response.put("message", "Stock item not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
