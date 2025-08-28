# Database Design - Nutrition Management System

## 📊 Database Overview

The Nutrition Management System uses MySQL 8.0+ as the primary database with Sequelize ORM for data modeling and migrations. The database is designed to support user authentication, food nutrition tracking, and meal logging functionality.

---

## 🏗️ Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      Users      │         │   User_Meals    │         │     Foods       │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ PK: id          │◄────────┤ FK: user_id     │────────►│ PK: id          │
│    username     │         │ FK: food_id     │         │    name         │
│    email        │         │    quantity     │         │    brand        │
│    password_hash│         │    meal_type    │         │ calories_per_100g│
│    full_name    │         │    consumed_at  │         │ protein_per_100g │
│    age          │         │    created_at   │         │  carbs_per_100g  │
│    gender       │         └─────────────────┘         │   fat_per_100g   │
│    height       │                                     │  fiber_per_100g  │
│    weight       │                                     │  sugar_per_100g  │
│ activity_level  │                                     │ sodium_per_100g  │
│    created_at   │                                     │    category      │
│    updated_at   │                                     │    created_at    │
└─────────────────┘                                     │    updated_at    │
                                                        └─────────────────┘
```

**Relationships:**
- Users (1) ─── (N) User_Meals
- Foods (1) ─── (N) User_Meals

---

## 📋 Table Specifications

### 1. Users Table

Stores user account information and profile data for nutrition calculations.

```sql
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
```

**Field Descriptions:**
- `id`: Primary key, auto-increment
- `username`: Unique username (3-50 characters, alphanumeric)
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password (12 rounds)
- `full_name`: Optional display name
- `age`: User age (10-120 years)
- `gender`: Used for BMR calculations
- `height`: Height in centimeters (50-300)
- `weight`: Weight in kilograms (20-500)
- `activity_level`: Used for daily calorie calculations

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `username`
- UNIQUE INDEX on `email`

**Business Rules:**
- Username must be alphanumeric only
- Email must be valid format
- Password must be hashed before storage
- Age, height, weight are optional for basic functionality

---

### 2. Foods Table

Contains comprehensive nutrition information for food items.

```sql
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
```

**Field Descriptions:**
- `id`: Primary key, auto-increment
- `name`: Food name (required, 1-100 characters)
- `brand`: Optional brand name
- `calories_per_100g`: Calories per 100 grams (required)
- `protein_per_100g`: Protein content in grams per 100g
- `carbs_per_100g`: Carbohydrate content in grams per 100g
- `fat_per_100g`: Fat content in grams per 100g
- `fiber_per_100g`: Fiber content in grams per 100g
- `sugar_per_100g`: Sugar content in grams per 100g
- `sodium_per_100g`: Sodium content in milligrams per 100g
- `category`: Food category for organization

**Food Categories:**
- `grains`: Grains & Starches (rice, bread, noodles)
- `protein`: Protein sources (meat, fish, eggs, legumes)
- `vegetables`: All types of vegetables
- `fruits`: Fresh and dried fruits
- `dairy`: Milk products and cheese
- `beverages`: Drinks and liquid refreshments
- `snacks`: Processed foods and treats
- `other`: Miscellaneous food items

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `name` for search optimization
- INDEX on `category` for filtering

**Business Rules:**
- All nutritional values are per 100 grams
- Calories are required, other nutrients are optional
- Category defaults to 'other' if not specified

---

### 3. User_Meals Table

Tracks individual meal entries logged by users.

```sql
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
```

**Field Descriptions:**
- `id`: Primary key, auto-increment
- `user_id`: Reference to users table
- `food_id`: Reference to foods table
- `quantity`: Amount consumed in grams (0.1-10000)
- `meal_type`: Type of meal (breakfast, lunch, dinner, snack)
- `consumed_at`: When the food was consumed

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` → `users(id)`
- FOREIGN KEY on `food_id` → `foods(id)`
- INDEX on `user_id` for user queries
- INDEX on `consumed_at` for date-based queries
- COMPOSITE INDEX on `(user_id, consumed_at)` for daily summaries

**Business Rules:**
- Quantity must be positive
- Consumed_at defaults to current timestamp
- Cascade delete when user or food is deleted

---

## 🔍 Database Queries & Optimization

### Common Query Patterns

**1. Daily Nutrition Summary**
```sql
SELECT 
  um.meal_type,
  SUM(f.calories_per_100g * um.quantity / 100) as calories,
  SUM(f.protein_per_100g * um.quantity / 100) as protein,
  SUM(f.carbs_per_100g * um.quantity / 100) as carbs,
  SUM(f.fat_per_100g * um.quantity / 100) as fat
FROM user_meals um
JOIN foods f ON um.food_id = f.id
WHERE um.user_id = ? 
  AND DATE(um.consumed_at) = ?
GROUP BY um.meal_type;
```

**2. Food Search**
```sql
SELECT * FROM foods 
WHERE name LIKE ? 
ORDER BY name ASC 
LIMIT 20;
```

**3. User Statistics**
```sql
SELECT 
  COUNT(*) as total_meals,
  COUNT(DISTINCT um.food_id) as unique_foods,
  AVG(daily_calories) as avg_daily_calories
FROM user_meals um
JOIN foods f ON um.food_id = f.id
WHERE um.user_id = ? 
  AND um.consumed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### Performance Optimizations

**Indexes Applied:**
- Users: `username`, `email` for authentication
- Foods: `name` for search, `category` for filtering
- User_Meals: `user_id`, `consumed_at`, composite `(user_id, consumed_at)`

**Query Optimization Strategies:**
- Use prepared statements to prevent SQL injection
- Limit result sets with LIMIT clauses
- Use appropriate indexes for WHERE and ORDER BY clauses
- Consider denormalization for frequently accessed calculated values

---

## 📊 Sample Data

### Users (Demo Data)
```sql
INSERT INTO users (username, email, password_hash, full_name, age, gender, height, weight, activity_level) VALUES
('demo', 'demo@nutrition.app', '$2b$12$...', 'Demo User', 25, 'male', 175, 70, 'moderate'),
('jane_doe', 'jane@example.com', '$2b$12$...', 'Jane Doe', 28, 'female', 165, 60, 'active');
```

### Foods (Vietnamese & International)
```sql
INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category) VALUES
('Cơm trắng', 130, 2.7, 28.0, 0.3, 'grains'),
('Thịt bò', 250, 26.0, 0.0, 15.0, 'protein'),
('Cà chua', 18, 0.9, 3.9, 0.2, 'vegetables'),
('Chuối', 89, 1.1, 23.0, 0.3, 'fruits'),
('Sữa tươi', 42, 3.4, 5.0, 1.0, 'dairy');
```

---

## 🔒 Security Considerations

### Data Protection
- **Passwords**: Stored as bcrypt hashes with 12 rounds
- **Personal Data**: Optional fields to minimize required personal information
- **SQL Injection**: Prevented through Sequelize parameterized queries
- **Data Validation**: Input validation at both API and database levels

### Privacy
- Users can delete their accounts (CASCADE DELETE removes all related data)
- Minimal personal information required for basic functionality
- No sharing of personal data between users

### Backup & Recovery
- Regular database backups recommended
- Transaction-based operations for data consistency
- Rollback capabilities for failed operations

---

## 📈 Scalability Considerations

### Current Design Capacity
- **Users**: Designed for thousands of concurrent users
- **Foods**: Can handle extensive food databases (100,000+ items)
- **User_Meals**: Optimized for millions of meal entries

### Future Scaling Options
- **Sharding**: Partition by user_id for horizontal scaling
- **Read Replicas**: For read-heavy workloads
- **Caching**: Redis for frequently accessed food data
- **Archiving**: Move old meal data to separate tables

### Performance Monitoring
- Track query execution times
- Monitor index usage and effectiveness
- Analyze slow query logs
- Set up alerting for performance degradation

---

## 🛠️ Migration Scripts

Database migrations are located in `/database/migrations/` with the following order:
1. `001_create_users.sql` - Users table
2. `002_create_foods.sql` - Foods table  
3. `003_create_user_meals.sql` - User_meals table with foreign keys

**Running Migrations:**
```bash
# Create database
mysql -u root -p < database/schema.sql

# Insert sample data
mysql -u root -p nutrition_management < database/seeds/foods_data.sql
```

---

## 📊 Database Statistics

### Storage Estimates
- **Users**: ~500 bytes per user
- **Foods**: ~300 bytes per food item
- **User_Meals**: ~50 bytes per meal entry

### Expected Growth
- **Daily Meals**: 3-5 entries per active user
- **New Foods**: 10-50 per week
- **User Growth**: Depends on adoption rate

This database design provides a solid foundation for the nutrition management system while maintaining flexibility for future enhancements and optimizations.