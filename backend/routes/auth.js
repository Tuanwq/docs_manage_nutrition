const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, userRegistrationSchema, userLoginSchema } = require('../middleware/validation');

// Public routes
router.post('/register', validate(userRegistrationSchema), AuthController.register);
router.post('/login', validate(userLoginSchema), AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/verify', authenticateToken, AuthController.verifyToken);

module.exports = router;