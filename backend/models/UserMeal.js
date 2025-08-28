const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserMeal = sequelize.define('UserMeal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  food_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'foods',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.1,
      max: 10000
    }
  },
  meal_type: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false
  },
  consumed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_meals',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['consumed_at']
    },
    {
      fields: ['user_id', 'consumed_at']
    }
  ]
});

// Class methods
UserMeal.getUserMealsByDate = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findAll({
    where: {
      user_id: userId,
      consumed_at: {
        [sequelize.Sequelize.Op.between]: [startOfDay, endOfDay]
      }
    },
    include: [{
      model: require('./Food'),
      as: 'food'
    }],
    order: [['consumed_at', 'DESC']]
  });
};

UserMeal.getUserMealsByDateRange = function(userId, startDate, endDate) {
  return this.findAll({
    where: {
      user_id: userId,
      consumed_at: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      }
    },
    include: [{
      model: require('./Food'),
      as: 'food'
    }],
    order: [['consumed_at', 'DESC']]
  });
};

UserMeal.getDailyNutritionSummary = async function(userId, date) {
  const meals = await this.getUserMealsByDate(userId, date);
  
  const summary = {
    breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, foods: [] },
    lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, foods: [] },
    dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, foods: [] },
    snack: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, foods: [] },
    total: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  };

  meals.forEach(meal => {
    if (meal.food) {
      const nutrition = meal.food.calculateNutrition(meal.quantity);
      const mealType = meal.meal_type;
      
      // Add to meal type summary
      summary[mealType].calories += nutrition.calories;
      summary[mealType].protein += nutrition.protein;
      summary[mealType].carbs += nutrition.carbs;
      summary[mealType].fat += nutrition.fat;
      summary[mealType].fiber += nutrition.fiber;
      summary[mealType].sugar += nutrition.sugar;
      summary[mealType].sodium += nutrition.sodium;
      summary[mealType].foods.push({
        id: meal.id,
        food: meal.food,
        quantity: meal.quantity,
        nutrition: nutrition,
        consumed_at: meal.consumed_at
      });
      
      // Add to total
      summary.total.calories += nutrition.calories;
      summary.total.protein += nutrition.protein;
      summary.total.carbs += nutrition.carbs;
      summary.total.fat += nutrition.fat;
      summary.total.fiber += nutrition.fiber;
      summary.total.sugar += nutrition.sugar;
      summary.total.sodium += nutrition.sodium;
    }
  });

  // Round totals
  Object.keys(summary).forEach(key => {
    if (key !== 'total') {
      Object.keys(summary[key]).forEach(nutrient => {
        if (nutrient !== 'foods') {
          summary[key][nutrient] = Math.round(summary[key][nutrient] * 10) / 10;
        }
      });
    }
  });

  Object.keys(summary.total).forEach(nutrient => {
    summary.total[nutrient] = Math.round(summary.total[nutrient] * 10) / 10;
  });

  return summary;
};

module.exports = UserMeal;