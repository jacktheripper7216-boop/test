package com.inventory.controller;

import com.inventory.dto.ProductDTO;
import com.inventory.dto.StockDTO;
import com.inventory.model.Product;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productRepository.findAll()
                .stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(ProductDTO.fromEntity(product)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/{id}/stocks")
    public ResponseEntity<?> getStocksByProductId(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        List<StockDTO> stocks = stockRepository.findByProductId(id)
                .stream()
                .map(StockDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    @PostMapping
    public ResponseEntity<Object> createProduct(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        String name = (String) request.get("name");
        Long categoryId = request.get("category_id") != null
                ? Long.valueOf(request.get("category_id").toString())
                : null;

        if (name == null || categoryId == null) {
            response.put("message", "Product name and category_id are required");
            return ResponseEntity.badRequest().body(response);
        }

        if (!categoryRepository.existsById(categoryId)) {
            response.put("message", "Category with ID " + categoryId + " not found.");
            return ResponseEntity.badRequest().body(response);
        }

        Product product = new Product();
        product.setName(name);
        product.setBrand((String) request.get("brand"));
        product.setDescription((String) request.get("description"));
        if (request.get("warranty_months") != null) {
            product.setWarrantyMonths(Integer.valueOf(request.get("warranty_months").toString()));
        }
        product.setCategoryId(categoryId);
        product = productRepository.save(product);

        return ResponseEntity.status(HttpStatus.CREATED).body(ProductDTO.fromEntity(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        return productRepository.findById(id)
                .map(product -> {
                    if (request.containsKey("category_id")) {
                        Long categoryId = Long.valueOf(request.get("category_id").toString());
                        if (!categoryRepository.existsById(categoryId)) {
                            response.put("message", "Category with ID " + categoryId + " not found.");
                            return ResponseEntity.badRequest().body((Object) response);
                        }
                        product.setCategoryId(categoryId);
                    }
                    if (request.containsKey("name")) {
                        product.setName((String) request.get("name"));
                    }
                    if (request.containsKey("brand")) {
                        product.setBrand((String) request.get("brand"));
                    }
                    if (request.containsKey("description")) {
                        product.setDescription((String) request.get("description"));
                    }
                    if (request.containsKey("warranty_months")) {
                        product.setWarrantyMonths(Integer.valueOf(request.get("warranty_months").toString()));
                    }
                    productRepository.save(product);
                    return ResponseEntity.ok((Object) ProductDTO.fromEntity(product));
                })
                .orElseGet(() -> {
                    response.put("message", "Product not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteProduct(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    response.put("message", "Product deleted successfully");
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).body((Object) response);
                })
                .orElseGet(() -> {
                    response.put("message", "Product not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
