# API Documentation

## Nutrition Management System API

This document describes the REST API endpoints for the Nutrition Management System.

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "age": 25,
  "gender": "male",
  "height": 175.0,
  "weight": 70.0,
  "activity_level": "moderate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "age": 25,
      "gender": "male",
      "height": 175.0,
      "weight": 70.0,
      "activity_level": "moderate",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Login with username/email and password.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth/profile
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "age": 25,
    "gender": "male",
    "height": 175.0,
    "weight": 70.0,
    "activity_level": "moderate",
    "bmi": 22.9,
    "daily_calories": 2500,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## User Management Endpoints

### PUT /users/profile
Update user profile (requires authentication).

**Request Body:**
```json
{
  "full_name": "John Smith",
  "age": 26,
  "weight": 72.0,
  "activity_level": "active"
}
```

### POST /users/meals
Add a meal entry (requires authentication).

**Request Body:**
```json
{
  "food_id": 1,
  "quantity": 150.0,
  "meal_type": "breakfast",
  "consumed_at": "2024-01-01T08:00:00Z"
}
```

### GET /users/meals
Get meals for a specific date (requires authentication).

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**
```json
{
  "success": true,
  "message": "Meals retrieved successfully",
  "data": {
    "date": "2024-01-01",
    "meals": [
      {
        "id": 1,
        "food": {
          "id": 1,
          "name": "Cơm trắng",
          "calories_per_100g": 130
        },
        "quantity": 150.0,
        "meal_type": "breakfast",
        "consumed_at": "2024-01-01T08:00:00Z"
      }
    ]
  }
}
```

### GET /users/nutrition
Get daily nutrition summary (requires authentication).

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**
```json
{
  "success": true,
  "message": "Daily nutrition summary retrieved successfully",
  "data": {
    "date": "2024-01-01",
    "nutrition": {
      "breakfast": {
        "calories": 300,
        "protein": 15.0,
        "carbs": 50.0,
        "fat": 8.0,
        "foods": []
      },
      "lunch": {
        "calories": 450,
        "protein": 25.0,
        "carbs": 60.0,
        "fat": 12.0,
        "foods": []
      },
      "dinner": {
        "calories": 400,
        "protein": 20.0,
        "carbs": 55.0,
        "fat": 10.0,
        "foods": []
      },
      "snack": {
        "calories": 150,
        "protein": 5.0,
        "carbs": 20.0,
        "fat": 6.0,
        "foods": []
      },
      "total": {
        "calories": 1300,
        "protein": 65.0,
        "carbs": 185.0,
        "fat": 36.0
      }
    },
    "goals": {
      "calories": 2500,
      "protein": 125,
      "carbs": 313,
      "fat": 83
    }
  }
}
```

### PUT /users/meals/:mealId
Update a meal entry (requires authentication).

### DELETE /users/meals/:mealId
Delete a meal entry (requires authentication).

### GET /users/statistics
Get user statistics (requires authentication).

**Query Parameters:**
- `days` (optional): Number of days to include in statistics. Defaults to 7.

---

## Food Management Endpoints

### GET /foods
Get all foods with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number. Defaults to 1.
- `limit` (optional): Items per page. Defaults to 20.
- `search` (optional): Search term for food name.
- `category` (optional): Filter by category.
- `sort_by` (optional): Sort field. Options: name, calories_per_100g, protein_per_100g, created_at.
- `sort_order` (optional): Sort order. Options: ASC, DESC.

**Response:**
```json
{
  "success": true,
  "message": "Foods retrieved successfully",
  "data": {
    "foods": [
      {
        "id": 1,
        "name": "Cơm trắng",
        "brand": null,
        "calories_per_100g": 130.0,
        "protein_per_100g": 2.7,
        "carbs_per_100g": 28.0,
        "fat_per_100g": 0.3,
        "fiber_per_100g": 0.4,
        "sugar_per_100g": 0.1,
        "sodium_per_100g": 1.0,
        "category": "grains",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

### GET /foods/search
Search foods by name.

**Query Parameters:**
- `q`: Search query (required, minimum 2 characters).
- `limit` (optional): Maximum results. Defaults to 20.

### GET /foods/categories
Get all food categories.

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "value": "grains",
      "label": "Grains & Starches",
      "description": "Rice, bread, noodles, cereals"
    },
    {
      "value": "protein",
      "label": "Protein",
      "description": "Meat, fish, eggs, legumes"
    }
  ]
}
```

### GET /foods/category/:category
Get foods by category.

**Path Parameters:**
- `category`: Category name.

**Query Parameters:**
- `limit` (optional): Maximum results. Defaults to 50.

### GET /foods/:id
Get food details by ID.

### POST /foods
Create a new food (requires authentication).

**Request Body:**
```json
{
  "name": "Apple",
  "brand": "Organic Farms",
  "calories_per_100g": 52.0,
  "protein_per_100g": 0.3,
  "carbs_per_100g": 14.0,
  "fat_per_100g": 0.2,
  "fiber_per_100g": 2.4,
  "sugar_per_100g": 10.0,
  "sodium_per_100g": 1.0,
  "category": "fruits"
}
```

### PUT /foods/:id
Update a food (requires authentication).

### DELETE /foods/:id
Delete a food (requires authentication).

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Authenticated users may have higher limits

---

## Data Types

### User Object
```json
{
  "id": "integer",
  "username": "string (3-50 characters, alphanumeric)",
  "email": "string (valid email)",
  "full_name": "string (optional, 2-100 characters)",
  "age": "integer (optional, 10-120)",
  "gender": "enum (male, female, other)",
  "height": "float (optional, 50-300 cm)",
  "weight": "float (optional, 20-500 kg)",
  "activity_level": "enum (sedentary, light, moderate, active, very_active)",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Food Object
```json
{
  "id": "integer",
  "name": "string (1-100 characters)",
  "brand": "string (optional, max 100 characters)",
  "calories_per_100g": "float (0-1000)",
  "protein_per_100g": "float (0-100)",
  "carbs_per_100g": "float (0-100)",
  "fat_per_100g": "float (0-100)",
  "fiber_per_100g": "float (0-100)",
  "sugar_per_100g": "float (0-100)",
  "sodium_per_100g": "float (0-10000 mg)",
  "category": "enum (grains, protein, vegetables, fruits, dairy, beverages, snacks, other)",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### UserMeal Object
```json
{
  "id": "integer",
  "user_id": "integer",
  "food_id": "integer",
  "quantity": "float (0.1-10000 grams)",
  "meal_type": "enum (breakfast, lunch, dinner, snack)",
  "consumed_at": "ISO 8601 datetime"
}
```