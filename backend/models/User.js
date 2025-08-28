const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');
const config = require('../config/config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 10,
      max: 120
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 50,
      max: 300
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 20,
      max: 500
    }
  },
  activity_level: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    allowNull: false,
    defaultValue: 'moderate'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, config.security.bcryptRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, config.security.bcryptRounds);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  return values;
};

// Calculate BMI
User.prototype.calculateBMI = function() {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
};

// Calculate daily calorie needs (Harris-Benedict equation)
User.prototype.calculateDailyCalories = function() {
  if (!this.age || !this.height || !this.weight || !this.gender) {
    return null;
  }

  let bmr;
  if (this.gender === 'male') {
    bmr = 88.362 + (13.397 * this.weight) + (4.799 * this.height) - (5.677 * this.age);
  } else {
    bmr = 447.593 + (9.247 * this.weight) + (3.098 * this.height) - (4.330 * this.age);
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  return Math.round(bmr * activityMultipliers[this.activity_level]);
};

module.exports = User;