
package com.medilens.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.medilens.backend.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long jwtExpiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") long jwtExpiration) {

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must be at least 32 bytes long"
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.jwtExpiration = jwtExpiration;
    }

    // Generate JWT Token
    public String generateToken(User user) {

        Date issuedAt = new Date();

        Date expirationDate =
                new Date(issuedAt.getTime() + jwtExpiration);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .issuedAt(issuedAt)
                .expiration(expirationDate)
                .signWith(secretKey)
                .compact();
    }

    // Extract User ID From Token
    public UUID extractUserId(String token) {

        Claims claims = extractAllClaims(token);

        return UUID.fromString(claims.getSubject());
    }

    // Extract Email From Token
    public String extractEmail(String token) {

        Claims claims = extractAllClaims(token);

        return claims.get("email", String.class);
    }

    // Validate JWT Token
    public boolean isTokenValid(String token, User user) {

        try {

            Claims claims = extractAllClaims(token);

            UUID userId = UUID.fromString(claims.getSubject());

            return userId.equals(user.getId())
                    && user.getEmail().equals(
                            claims.get("email", String.class))
                    && claims.getExpiration().after(new Date());

        } catch (JwtException | IllegalArgumentException exception) {

            return false;
        }
    }

    // Extract All Token Claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
