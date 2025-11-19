package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.StockDto;
import com.smartinventory.model.Product;
import com.smartinventory.model.Stock;
import com.smartinventory.model.Supplier;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.StockRepository;
import com.smartinventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<List<StockDto>> getAllStocks() {
        List<StockDto> stocks = stockRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStockById(@PathVariable Long id) {
        return stockRepository.findById(id)
                .map(stock -> ResponseEntity.ok(convertToDto(stock)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @PostMapping
    public ResponseEntity<?> createStock(@RequestBody StockDto stockDto) {
        if (stockDto.getProductId() == null || stockDto.getSupplierId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse("Product ID and Supplier ID are required"));
        }

        if (stockDto.getQuantity() == null || stockDto.getSellingPrice() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse("Quantity and selling price are required"));
        }

        Stock stock = new Stock();

        Product product = productRepository.findById(stockDto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Supplier supplier = supplierRepository.findById(stockDto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        stock.setProduct(product);
        stock.setSupplier(supplier);
        stock.setLocation(stockDto.getLocation());
        stock.setQuantity(stockDto.getQuantity());
        stock.setCostPrice(stockDto.getCostPrice());
        stock.setSellingPrice(stockDto.getSellingPrice());
        stock.setDepositedByUserId(stockDto.getDepositedByUserId());
        stock.setExpirationDate(stockDto.getExpirationDate());

        Stock savedStock = stockRepository.save(stock);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedStock));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody StockDto stockDto) {
        return stockRepository.findById(id)
                .map(stock -> {
                    if (stockDto.getProductId() != null) {
                        Product product = productRepository.findById(stockDto.getProductId()).orElse(null);
                        stock.setProduct(product);
                    }
                    if (stockDto.getSupplierId() != null) {
                        Supplier supplier = supplierRepository.findById(stockDto.getSupplierId()).orElse(null);
                        stock.setSupplier(supplier);
                    }
                    if (stockDto.getLocation() != null) {
                        stock.setLocation(stockDto.getLocation());
                    }
                    if (stockDto.getQuantity() != null) {
                        stock.setQuantity(stockDto.getQuantity());
                    }
                    if (stockDto.getCostPrice() != null) {
                        stock.setCostPrice(stockDto.getCostPrice());
                    }
                    if (stockDto.getSellingPrice() != null) {
                        stock.setSellingPrice(stockDto.getSellingPrice());
                    }
                    if (stockDto.getExpirationDate() != null) {
                        stock.setExpirationDate(stockDto.getExpirationDate());
                    }
                    Stock updatedStock = stockRepository.save(stock);
                    return ResponseEntity.ok(convertToDto(updatedStock));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStock(@PathVariable Long id) {
        if (!stockRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse("Stock not found"));
        }
        stockRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse("Stock deleted successfully"));
    }

    private StockDto convertToDto(Stock stock) {
        StockDto dto = new StockDto();
        dto.setId(stock.getId());
        dto.setProductId(stock.getProduct() != null ? stock.getProduct().getId() : null);
        dto.setSupplierId(stock.getSupplier() != null ? stock.getSupplier().getId() : null);
        dto.setLocation(stock.getLocation());
        dto.setQuantity(stock.getQuantity());
        dto.setCostPrice(stock.getCostPrice());
        dto.setSellingPrice(stock.getSellingPrice());
        dto.setDepositedByUserId(stock.getDepositedByUserId());
        dto.setDepositedAt(stock.getDepositedAt());
        dto.setExpirationDate(stock.getExpirationDate());
        dto.setProductName(stock.getProduct() != null ? stock.getProduct().getName() : null);
        dto.setSupplierName(stock.getSupplier() != null ? stock.getSupplier().getName() : null);
        return dto;
    }
}
