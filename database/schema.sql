-- Database schema for Nutrition Management System
-- Created for Sprint 1 implementation

-- Create database
CREATE DATABASE IF NOT EXISTS nutrition_management;
USE nutrition_management;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  age INT,
  gender ENUM('male', 'female', 'other'),
  height FLOAT,
  weight FLOAT,
  activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') DEFAULT 'moderate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Foods table
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

-- User meals table
CREATE TABLE user_meals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  quantity FLOAT NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
  INDEX idx_user_meals_user_id (user_id),
  INDEX idx_user_meals_consumed_at (consumed_at)
);