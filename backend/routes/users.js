const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validate, userUpdateSchema, userMealCreateSchema } = require('../middleware/validation');

// Profile routes
router.put('/profile', authenticateToken, validate(userUpdateSchema), UserController.updateProfile);

// Meal tracking routes
router.post('/meals', authenticateToken, validate(userMealCreateSchema), UserController.addMeal);
router.get('/meals', authenticateToken, UserController.getMealsByDate);
router.get('/nutrition', authenticateToken, UserController.getDailyNutrition);
router.put('/meals/:mealId', authenticateToken, UserController.updateMeal);
router.delete('/meals/:mealId', authenticateToken, UserController.deleteMeal);

// Statistics routes
router.get('/statistics', authenticateToken, UserController.getStatistics);

module.exports = router;