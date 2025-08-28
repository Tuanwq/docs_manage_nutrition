const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Food = sequelize.define('Food', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  calories_per_100g: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 1000
    }
  },
  protein_per_100g: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  carbs_per_100g: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  fat_per_100g: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  fiber_per_100g: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  sugar_per_100g: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  sodium_per_100g: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10000
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'other',
    validate: {
      isIn: [['grains', 'protein', 'vegetables', 'fruits', 'dairy', 'beverages', 'snacks', 'other']]
    }
  }
}, {
  tableName: 'foods',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
Food.prototype.calculateNutrition = function(quantity) {
  const factor = quantity / 100;
  return {
    calories: Math.round(this.calories_per_100g * factor),
    protein: Math.round(this.protein_per_100g * factor * 10) / 10,
    carbs: Math.round(this.carbs_per_100g * factor * 10) / 10,
    fat: Math.round(this.fat_per_100g * factor * 10) / 10,
    fiber: Math.round(this.fiber_per_100g * factor * 10) / 10,
    sugar: Math.round(this.sugar_per_100g * factor * 10) / 10,
    sodium: Math.round(this.sodium_per_100g * factor * 10) / 10
  };
};

// Class methods
Food.searchByName = function(searchTerm, limit = 20) {
  return this.findAll({
    where: {
      name: {
        [sequelize.Sequelize.Op.like]: `%${searchTerm}%`
      }
    },
    limit,
    order: [['name', 'ASC']]
  });
};

Food.getByCategory = function(category, limit = 50) {
  return this.findAll({
    where: { category },
    limit,
    order: [['name', 'ASC']]
  });
};

module.exports = Food;