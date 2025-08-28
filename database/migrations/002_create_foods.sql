-- Migration: Create foods table
-- Date: 2024-01-01
-- Version: 002

CREATE TABLE foods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  calories_per_100g FLOAT NOT NULL,
  protein_per_100g FLOAT DEFAULT 0,
  carbs_per_100g FLOAT DEFAULT 0,
  fat_per_100g FLOAT DEFAULT 0,
  fiber_per_100g FLOAT DEFAULT 0,
  sugar_per_100g FLOAT DEFAULT 0,
  sodium_per_100g FLOAT DEFAULT 0,
  category VARCHAR(50) DEFAULT 'other',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);