package com.inventory.repository;

import com.inventory.model.Auth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AuthRepository extends JpaRepository<Auth, Long> {
    @Query("SELECT a FROM Auth a WHERE a.user.username = :username")
    Optional<Auth> findByUsername(String username);
}
