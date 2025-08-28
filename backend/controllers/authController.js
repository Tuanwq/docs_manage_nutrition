const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { username, email, password, ...profileData } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [
            { username: username },
            { email: email }
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: existingUser.username === username 
            ? 'Username already exists' 
            : 'Email already exists'
        });
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        password_hash: password, // Will be hashed by the model hook
        ...profileData
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user by username or email
      const user = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [
            { username: username },
            { email: username }
          ]
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = req.user;
      
      // Calculate additional metrics
      const profile = {
        ...user.toJSON(),
        bmi: user.calculateBMI(),
        daily_calories: user.calculateDailyCalories()
      };

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify token
  static async verifyToken(req, res) {
    try {
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user.toJSON()
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;