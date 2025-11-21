package com.inventory.controller;

import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final SaleRepository saleRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Count statistics
        stats.put("totalProducts", productRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalSuppliers", supplierRepository.count());
        stats.put("totalStockItems", stockRepository.count());
        stats.put("totalSales", saleRepository.count());
        stats.put("totalClients", clientRepository.count());
        stats.put("totalUsers", userRepository.count());

        // Get recent data
        stats.put("products", productRepository.findAll());
        stats.put("categories", categoryRepository.findAll());
        stats.put("suppliers", supplierRepository.findAll());
        stats.put("stockItems", stockRepository.findAll());
        stats.put("clients", clientRepository.findAll());

        // Calculate inventory value
        BigDecimal totalInventoryValue = stockRepository.findAll().stream()
                .filter(stock -> stock.getCostPrice() != null)
                .map(stock -> stock.getCostPrice().multiply(BigDecimal.valueOf(stock.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalInventoryValue", totalInventoryValue);

        // Calculate potential sales value
        BigDecimal potentialSalesValue = stockRepository.findAll().stream()
                .filter(stock -> stock.getSellingPrice() != null)
                .map(stock -> stock.getSellingPrice().multiply(BigDecimal.valueOf(stock.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("potentialSalesValue", potentialSalesValue);

        // Count low stock items (less than 10 units)
        long lowStockCount = stockRepository.findAll().stream()
                .filter(stock -> stock.getQuantity() < 10)
                .count();
        stats.put("lowStockItems", lowStockCount);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();

        summary.put("products", productRepository.count());
        summary.put("categories", categoryRepository.count());
        summary.put("suppliers", supplierRepository.count());
        summary.put("stockItems", stockRepository.count());
        summary.put("sales", saleRepository.count());
        summary.put("clients", clientRepository.count());

        return ResponseEntity.ok(summary);
    }
}
