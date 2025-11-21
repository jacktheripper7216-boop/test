package com.inventory.controller;

import com.inventory.model.Client;
import com.inventory.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientRepository.findAll();
        // Avoid circular reference by clearing sales
        clients.forEach(c -> c.setSales(null));
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClientById(@PathVariable Long id) {
        return clientRepository.findById(id)
                .map(client -> {
                    client.setSales(null);
                    return ResponseEntity.ok(client);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @PostMapping
    public ResponseEntity<Object> createClient(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        String name = (String) request.get("name");

        if (name == null || name.trim().isEmpty()) {
            response.put("message", "Client name is required");
            return ResponseEntity.badRequest().body(response);
        }

        Client client = new Client();
        client.setName(name);
        client.setContactPhone((String) request.get("contact_phone"));
        client.setContactEmail((String) request.get("contact_email"));
        client.setAddress((String) request.get("address"));

        if (request.get("is_credit_client") != null) {
            client.setIsCreditClient((Boolean) request.get("is_credit_client"));
        }

        if (request.get("credit_limit") != null) {
            client.setCreditLimit(new BigDecimal(request.get("credit_limit").toString()));
        }

        if (request.get("current_month_status") != null) {
            client.setCurrentMonthStatus((String) request.get("current_month_status"));
        }

        client = clientRepository.save(client);
        client.setSales(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(client);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateClient(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        return clientRepository.findById(id)
                .map(client -> {
                    if (request.containsKey("name")) {
                        client.setName((String) request.get("name"));
                    }
                    if (request.containsKey("contact_phone")) {
                        client.setContactPhone((String) request.get("contact_phone"));
                    }
                    if (request.containsKey("contact_email")) {
                        client.setContactEmail((String) request.get("contact_email"));
                    }
                    if (request.containsKey("address")) {
                        client.setAddress((String) request.get("address"));
                    }
                    if (request.containsKey("is_credit_client")) {
                        client.setIsCreditClient((Boolean) request.get("is_credit_client"));
                    }
                    if (request.containsKey("credit_limit")) {
                        Object creditLimit = request.get("credit_limit");
                        if (creditLimit != null) {
                            client.setCreditLimit(new BigDecimal(creditLimit.toString()));
                        } else {
                            client.setCreditLimit(null);
                        }
                    }
                    if (request.containsKey("current_month_status")) {
                        client.setCurrentMonthStatus((String) request.get("current_month_status"));
                    }

                    clientRepository.save(client);
                    client.setSales(null);
                    return ResponseEntity.ok((Object) client);
                })
                .orElseGet(() -> {
                    response.put("message", "Client not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteClient(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        return clientRepository.findById(id)
                .map(client -> {
                    clientRepository.delete(client);
                    response.put("message", "Client deleted successfully");
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).body((Object) response);
                })
                .orElseGet(() -> {
                    response.put("message", "Client not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
