package com.inventory.controller;

import com.inventory.dto.SaleDTO;
import com.inventory.model.Sale;
import com.inventory.model.SaleItem;
import com.inventory.model.Stock;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;

    @GetMapping
    public ResponseEntity<List<SaleDTO>> getAllSales() {
        List<SaleDTO> sales = saleRepository.findAll()
                .stream()
                .map(SaleDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSaleById(@PathVariable Long id) {
        return saleRepository.findById(id)
                .map(sale -> ResponseEntity.ok(SaleDTO.fromEntity(sale)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<SaleDTO>> getSalesByClient(@PathVariable Long clientId) {
        List<SaleDTO> sales = saleRepository.findByClientId(clientId)
                .stream()
                .map(SaleDTO::fromEntity)
                .collect(Collectors.toList());
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
        String paymentMethod = (String) request.get("payment_method");

        if (clientId == null || userId == null || paymentMethod == null) {
            response.put("message", "client_id, user_id, and payment_method are required");
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

        // Create the sale
        Sale sale = new Sale();
        sale.setClientId(clientId);
        sale.setUserId(userId);
        sale.setPaymentMethod(paymentMethod);
        sale.setSaleDate(LocalDateTime.now());

        if (request.get("discount_applied") != null) {
            sale.setDiscountApplied(new BigDecimal(request.get("discount_applied").toString()));
        } else {
            sale.setDiscountApplied(BigDecimal.ZERO);
        }

        // Process items
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");

        if (items == null || items.isEmpty()) {
            response.put("message", "At least one item is required");
            return ResponseEntity.badRequest().body(response);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (Map<String, Object> item : items) {
            Long stockId = Long.valueOf(item.get("stock_id").toString());
            Integer quantity = Integer.valueOf(item.get("quantity").toString());

            Optional<Stock> stockOpt = stockRepository.findById(stockId);
            if (stockOpt.isEmpty()) {
                response.put("message", "Stock with ID " + stockId + " not found");
                return ResponseEntity.badRequest().body(response);
            }

            Stock stock = stockOpt.get();
            if (stock.getQuantity() < quantity) {
                response.put("message", "Insufficient stock for stock ID " + stockId +
                        ". Available: " + stock.getQuantity() + ", Requested: " + quantity);
                return ResponseEntity.badRequest().body(response);
            }

            BigDecimal unitPrice = stock.getSellingPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(subtotal);

            SaleItem saleItem = new SaleItem();
            saleItem.setStockId(stockId);
            saleItem.setQuantitySold(quantity);
            saleItem.setUnitPriceAtSale(unitPrice);
            saleItems.add(saleItem);

            // Update stock quantity
            stock.setQuantity(stock.getQuantity() - quantity);
            stockRepository.save(stock);
        }

        // Apply discount
        if (sale.getDiscountApplied() != null && sale.getDiscountApplied().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = totalAmount.multiply(sale.getDiscountApplied()).divide(BigDecimal.valueOf(100));
            totalAmount = totalAmount.subtract(discountAmount);
        }

        sale.setTotalAmount(totalAmount);
        sale = saleRepository.save(sale);

        // Save sale items with the sale ID
        for (SaleItem saleItem : saleItems) {
            saleItem.setSaleId(sale.getId());
            saleItemRepository.save(saleItem);
        }

        // Reload the sale with items
        Sale finalSale = saleRepository.findById(sale.getId()).orElse(sale);
        return ResponseEntity.status(HttpStatus.CREATED).body(SaleDTO.fromEntity(finalSale));
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
