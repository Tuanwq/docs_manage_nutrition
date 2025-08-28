-- Sample food data for testing
-- Insert common Vietnamese and international foods

INSERT INTO foods (name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, category) VALUES
-- Grains and Starches
('Cơm trắng', NULL, 130, 2.7, 28.0, 0.3, 0.4, 0.1, 1, 'grains'),
('Bánh mì', 'Kinh Đô', 265, 8.0, 49.0, 4.2, 2.7, 5.0, 491, 'grains'),
('Phở bò', NULL, 85, 6.0, 10.0, 2.0, 1.0, 1.5, 800, 'grains'),
('Bún', NULL, 109, 2.2, 25.0, 0.1, 1.8, 0.2, 3, 'grains'),

-- Proteins
('Thịt bò', NULL, 250, 26.0, 0.0, 15.0, 0.0, 0.0, 60, 'protein'),
('Thịt heo', NULL, 242, 27.0, 0.0, 14.0, 0.0, 0.0, 62, 'protein'),
('Gà', NULL, 165, 31.0, 0.0, 3.6, 0.0, 0.0, 70, 'protein'),
('Cá', NULL, 206, 22.0, 0.0, 12.0, 0.0, 0.0, 90, 'protein'),
('Trứng gà', NULL, 155, 13.0, 1.1, 11.0, 0.0, 1.1, 124, 'protein'),
('Tôm', NULL, 99, 24.0, 0.2, 0.3, 0.0, 0.0, 111, 'protein'),

-- Vegetables
('Rau muống', NULL, 19, 2.6, 2.1, 0.2, 2.1, 0.5, 113, 'vegetables'),
('Cà chua', NULL, 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, 'vegetables'),
('Cà rót', NULL, 25, 1.0, 6.0, 0.2, 3.0, 3.5, 2, 'vegetables'),
('Bắp cải', NULL, 25, 1.3, 6.0, 0.1, 2.5, 3.2, 18, 'vegetables'),
('Cà rốt', NULL, 41, 0.9, 9.6, 0.2, 2.8, 4.7, 69, 'vegetables'),

-- Fruits
('Chuối', NULL, 89, 1.1, 23.0, 0.3, 2.6, 12.0, 1, 'fruits'),
('Táo', NULL, 52, 0.3, 14.0, 0.2, 2.4, 10.0, 1, 'fruits'),
('Cam', NULL, 47, 0.9, 12.0, 0.1, 2.4, 9.4, 0, 'fruits'),
('Xoài', NULL, 60, 0.8, 15.0, 0.4, 1.6, 14.0, 1, 'fruits'),
('Dưa hấu', NULL, 30, 0.6, 8.0, 0.2, 0.4, 6.2, 1, 'fruits'),

-- Dairy
('Sữa tươi', 'TH True Milk', 42, 3.4, 5.0, 1.0, 0.0, 5.0, 44, 'dairy'),
('Sữa chua', 'Vinamilk', 59, 3.5, 4.7, 3.3, 0.0, 4.7, 46, 'dairy'),
('Phô mai', NULL, 113, 25.0, 1.3, 0.2, 0.0, 1.0, 653, 'dairy'),

-- Beverages
('Nước cam', NULL, 45, 0.7, 10.4, 0.2, 0.2, 8.4, 1, 'beverages'),
('Trà xanh', NULL, 1, 0.0, 0.0, 0.0, 0.0, 0.0, 1, 'beverages'),
('Cà phê đen', NULL, 1, 0.1, 0.0, 0.0, 0.0, 0.0, 2, 'beverages'),

-- Snacks
('Bánh quy', 'Orion', 502, 6.1, 62.0, 24.0, 2.0, 22.0, 386, 'snacks'),
('Kẹo', NULL, 387, 0.0, 100.0, 0.0, 0.0, 99.0, 32, 'snacks');