const { Food } = require('../models');
const { Op } = require('sequelize');

class FoodController {
  // Get all foods with pagination and filtering
  static async getAllFoods(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        sort_by = 'name',
        sort_order = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Add search filter
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }

      // Add category filter
      if (category) {
        whereClause.category = category;
      }

      // Validate sort fields
      const allowedSortFields = ['name', 'calories_per_100g', 'protein_per_100g', 'category', 'created_at'];
      const sortBy = allowedSortFields.includes(sort_by) ? sort_by : 'name';
      const sortOrder = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const foods = await Food.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]]
      });

      res.json({
        success: true,
        message: 'Foods retrieved successfully',
        data: {
          foods: foods.rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(foods.count / limit),
            total_items: foods.count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get foods error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get food by ID
  static async getFoodById(req, res) {
    try {
      const { id } = req.params;

      const food = await Food.findByPk(id);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      res.json({
        success: true,
        message: 'Food retrieved successfully',
        data: food
      });
    } catch (error) {
      console.error('Get food by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new food
  static async createFood(req, res) {
    try {
      const foodData = req.body;

      const food = await Food.create(foodData);

      res.status(201).json({
        success: true,
        message: 'Food created successfully',
        data: food
      });
    } catch (error) {
      console.error('Create food error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update food
  static async updateFood(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const food = await Food.findByPk(id);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      await food.update(updateData);

      res.json({
        success: true,
        message: 'Food updated successfully',
        data: food
      });
    } catch (error) {
      console.error('Update food error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete food
  static async deleteFood(req, res) {
    try {
      const { id } = req.params;

      const food = await Food.findByPk(id);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      await food.destroy();

      res.json({
        success: true,
        message: 'Food deleted successfully'
      });
    } catch (error) {
      console.error('Delete food error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search foods
  static async searchFoods(req, res) {
    try {
      const { q: searchTerm, limit = 20 } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters long'
        });
      }

      const foods = await Food.searchByName(searchTerm.trim(), parseInt(limit));

      res.json({
        success: true,
        message: 'Search completed successfully',
        data: {
          foods,
          search_term: searchTerm.trim(),
          total_results: foods.length
        }
      });
    } catch (error) {
      console.error('Search foods error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get foods by category
  static async getFoodsByCategory(req, res) {
    try {
      const { category } = req.params;
      const { limit = 50 } = req.query;

      const validCategories = ['grains', 'protein', 'vegetables', 'fruits', 'dairy', 'beverages', 'snacks', 'other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Valid categories are: ${validCategories.join(', ')}`
        });
      }

      const foods = await Food.getByCategory(category, parseInt(limit));

      res.json({
        success: true,
        message: 'Foods retrieved successfully',
        data: {
          foods,
          category,
          total_results: foods.length
        }
      });
    } catch (error) {
      console.error('Get foods by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get food categories
  static async getCategories(req, res) {
    try {
      const categories = [
        { value: 'grains', label: 'Grains & Starches', description: 'Rice, bread, noodles, cereals' },
        { value: 'protein', label: 'Protein', description: 'Meat, fish, eggs, legumes' },
        { value: 'vegetables', label: 'Vegetables', description: 'All types of vegetables' },
        { value: 'fruits', label: 'Fruits', description: 'Fresh and dried fruits' },
        { value: 'dairy', label: 'Dairy', description: 'Milk, cheese, yogurt' },
        { value: 'beverages', label: 'Beverages', description: 'Drinks and liquid refreshments' },
        { value: 'snacks', label: 'Snacks', description: 'Processed foods and treats' },
        { value: 'other', label: 'Other', description: 'Miscellaneous food items' }
      ];

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = FoodController;