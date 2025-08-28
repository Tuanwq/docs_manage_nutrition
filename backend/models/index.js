// Import models
const User = require('./User');
const Food = require('./Food');
const UserMeal = require('./UserMeal');

// Define associations
User.hasMany(UserMeal, {
  foreignKey: 'user_id',
  as: 'meals',
  onDelete: 'CASCADE'
});

UserMeal.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Food.hasMany(UserMeal, {
  foreignKey: 'food_id',
  as: 'userMeals',
  onDelete: 'CASCADE'
});

UserMeal.belongsTo(Food, {
  foreignKey: 'food_id',
  as: 'food'
});

module.exports = {
  User,
  Food,
  UserMeal
};