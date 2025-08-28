const { User, UserMeal, Food } = require('../models');

class UserController {
  // Update user profile
  static async updateProfile(req, res) {
    try {
      const user = req.user;
      const updateData = req.body;

      await user.update(updateData);

      // Calculate additional metrics
      const profile = {
        ...user.toJSON(),
        bmi: user.calculateBMI(),
        daily_calories: user.calculateDailyCalories()
      };

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
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

  // Add meal to user's log
  static async addMeal(req, res) {
    try {
      const userId = req.user.id;
      const { food_id, quantity, meal_type, consumed_at } = req.body;

      // Check if food exists
      const food = await Food.findByPk(food_id);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      // Create user meal entry
      const userMeal = await UserMeal.create({
        user_id: userId,
        food_id,
        quantity,
        meal_type,
        consumed_at: consumed_at || new Date()
      });

      // Get the meal with food details
      const mealWithFood = await UserMeal.findByPk(userMeal.id, {
        include: [{
          model: Food,
          as: 'food'
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Meal added successfully',
        data: mealWithFood
      });
    } catch (error) {
      console.error('Add meal error:', error);
      
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

  // Get user's meals for a specific date
  static async getMealsByDate(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;

      const targetDate = date ? new Date(date) : new Date();
      
      // Validate date
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const meals = await UserMeal.getUserMealsByDate(userId, targetDate);

      res.json({
        success: true,
        message: 'Meals retrieved successfully',
        data: {
          date: targetDate.toISOString().split('T')[0],
          meals
        }
      });
    } catch (error) {
      console.error('Get meals by date error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get daily nutrition summary
  static async getDailyNutrition(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;

      const targetDate = date ? new Date(date) : new Date();
      
      // Validate date
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const nutritionSummary = await UserMeal.getDailyNutritionSummary(userId, targetDate);

      // Get user's daily calorie goal
      const user = req.user;
      const dailyCalorieGoal = user.calculateDailyCalories();

      res.json({
        success: true,
        message: 'Daily nutrition summary retrieved successfully',
        data: {
          date: targetDate.toISOString().split('T')[0],
          nutrition: nutritionSummary,
          goals: {
            calories: dailyCalorieGoal,
            protein: dailyCalorieGoal ? Math.round(dailyCalorieGoal * 0.2 / 4) : null, // 20% of calories from protein
            carbs: dailyCalorieGoal ? Math.round(dailyCalorieGoal * 0.5 / 4) : null, // 50% of calories from carbs
            fat: dailyCalorieGoal ? Math.round(dailyCalorieGoal * 0.3 / 9) : null // 30% of calories from fat
          }
        }
      });
    } catch (error) {
      console.error('Get daily nutrition error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update meal entry
  static async updateMeal(req, res) {
    try {
      const userId = req.user.id;
      const { mealId } = req.params;
      const updateData = req.body;

      const meal = await UserMeal.findOne({
        where: {
          id: mealId,
          user_id: userId
        }
      });

      if (!meal) {
        return res.status(404).json({
          success: false,
          message: 'Meal not found'
        });
      }

      // If food_id is being updated, check if the new food exists
      if (updateData.food_id) {
        const food = await Food.findByPk(updateData.food_id);
        if (!food) {
          return res.status(404).json({
            success: false,
            message: 'Food not found'
          });
        }
      }

      await meal.update(updateData);

      // Get updated meal with food details
      const updatedMeal = await UserMeal.findByPk(meal.id, {
        include: [{
          model: Food,
          as: 'food'
        }]
      });

      res.json({
        success: true,
        message: 'Meal updated successfully',
        data: updatedMeal
      });
    } catch (error) {
      console.error('Update meal error:', error);
      
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

  // Delete meal entry
  static async deleteMeal(req, res) {
    try {
      const userId = req.user.id;
      const { mealId } = req.params;

      const meal = await UserMeal.findOne({
        where: {
          id: mealId,
          user_id: userId
        }
      });

      if (!meal) {
        return res.status(404).json({
          success: false,
          message: 'Meal not found'
        });
      }

      await meal.destroy();

      res.json({
        success: true,
        message: 'Meal deleted successfully'
      });
    } catch (error) {
      console.error('Delete meal error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user statistics
  static async getStatistics(req, res) {
    try {
      const userId = req.user.id;
      const { days = 7 } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(days) + 1);

      const meals = await UserMeal.getUserMealsByDateRange(userId, startDate, endDate);

      // Calculate statistics
      const stats = {
        total_meals: meals.length,
        total_foods: new Set(meals.map(meal => meal.food_id)).size,
        average_calories_per_day: 0,
        most_consumed_foods: [],
        meal_type_distribution: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0
        }
      };

      // Calculate daily averages and distributions
      const dailyCalories = {};
      const foodCounts = {};

      meals.forEach(meal => {
        const date = meal.consumed_at.toISOString().split('T')[0];
        const nutrition = meal.food ? meal.food.calculateNutrition(meal.quantity) : { calories: 0 };

        // Daily calories
        if (!dailyCalories[date]) {
          dailyCalories[date] = 0;
        }
        dailyCalories[date] += nutrition.calories;

        // Food counts
        const foodKey = `${meal.food?.name || 'Unknown'}_${meal.food_id}`;
        foodCounts[foodKey] = (foodCounts[foodKey] || 0) + 1;

        // Meal type distribution
        stats.meal_type_distribution[meal.meal_type]++;
      });

      // Calculate average calories per day
      const calorieDays = Object.values(dailyCalories);
      stats.average_calories_per_day = calorieDays.length > 0 
        ? Math.round(calorieDays.reduce((sum, cal) => sum + cal, 0) / calorieDays.length)
        : 0;

      // Get most consumed foods
      stats.most_consumed_foods = Object.entries(foodCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([foodKey, count]) => ({
          food_name: foodKey.split('_')[0],
          times_consumed: count
        }));

      res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: {
          period: {
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            days: parseInt(days)
          },
          statistics: stats
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = UserController;