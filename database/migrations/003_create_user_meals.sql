-- Migration: Create user_meals table
-- Date: 2024-01-01
-- Version: 003

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