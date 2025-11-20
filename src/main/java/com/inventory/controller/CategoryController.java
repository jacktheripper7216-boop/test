package com.inventory.controller;

import com.inventory.dto.CategoryDTO;
import com.inventory.model.Category;
import com.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryRepository.findAll()
                .stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> ResponseEntity.ok(CategoryDTO.fromEntity(category)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    @PostMapping
    public ResponseEntity<Object> createCategory(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String name = request.get("name");

        if (name == null || name.isEmpty()) {
            response.put("message", "Category name is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (categoryRepository.existsByName(name)) {
            response.put("message", "Category '" + name + "' already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(request.get("description"));
        category = categoryRepository.save(category);

        return ResponseEntity.status(HttpStatus.CREATED).body(CategoryDTO.fromEntity(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateCategory(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        return categoryRepository.findById(id)
                .map(category -> {
                    if (request.containsKey("name")) {
                        category.setName(request.get("name"));
                    }
                    if (request.containsKey("description")) {
                        category.setDescription(request.get("description"));
                    }
                    categoryRepository.save(category);
                    return ResponseEntity.ok((Object) CategoryDTO.fromEntity(category));
                })
                .orElseGet(() -> {
                    response.put("message", "Category not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteCategory(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        return categoryRepository.findById(id)
                .map(category -> {
                    categoryRepository.delete(category);
                    response.put("message", "Category deleted successfully");
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).body((Object) response);
                })
                .orElseGet(() -> {
                    response.put("message", "Category not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
