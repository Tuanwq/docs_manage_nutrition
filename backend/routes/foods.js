const express = require('express');
const router = express.Router();
const FoodController = require('../controllers/foodController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, foodCreateSchema, foodUpdateSchema } = require('../middleware/validation');

// Public routes (with optional authentication for personalization)
router.get('/', optionalAuth, FoodController.getAllFoods);
router.get('/search', optionalAuth, FoodController.searchFoods);
router.get('/categories', optionalAuth, FoodController.getCategories);
router.get('/category/:category', optionalAuth, FoodController.getFoodsByCategory);
router.get('/:id', optionalAuth, FoodController.getFoodById);

// Protected routes (authentication required)
router.post('/', authenticateToken, validate(foodCreateSchema), FoodController.createFood);
router.put('/:id', authenticateToken, validate(foodUpdateSchema), FoodController.updateFood);
router.delete('/:id', authenticateToken, FoodController.deleteFood);

module.exports = router;