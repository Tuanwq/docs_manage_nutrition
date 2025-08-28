const Joi = require('joi');

// User validation schemas
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  full_name: Joi.string().min(2).max(100).optional(),
  age: Joi.number().integer().min(10).max(120).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  height: Joi.number().min(50).max(300).optional(),
  weight: Joi.number().min(20).max(500).optional(),
  activity_level: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active').optional()
});

const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const userUpdateSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  age: Joi.number().integer().min(10).max(120).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  height: Joi.number().min(50).max(300).optional(),
  weight: Joi.number().min(20).max(500).optional(),
  activity_level: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active').optional()
});

// Food validation schemas
const foodCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  brand: Joi.string().max(100).optional(),
  calories_per_100g: Joi.number().min(0).max(1000).required(),
  protein_per_100g: Joi.number().min(0).max(100).optional().default(0),
  carbs_per_100g: Joi.number().min(0).max(100).optional().default(0),
  fat_per_100g: Joi.number().min(0).max(100).optional().default(0),
  fiber_per_100g: Joi.number().min(0).max(100).optional().default(0),
  sugar_per_100g: Joi.number().min(0).max(100).optional().default(0),
  sodium_per_100g: Joi.number().min(0).max(10000).optional().default(0),
  category: Joi.string().valid('grains', 'protein', 'vegetables', 'fruits', 'dairy', 'beverages', 'snacks', 'other').optional().default('other')
});

const foodUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  brand: Joi.string().max(100).optional(),
  calories_per_100g: Joi.number().min(0).max(1000).optional(),
  protein_per_100g: Joi.number().min(0).max(100).optional(),
  carbs_per_100g: Joi.number().min(0).max(100).optional(),
  fat_per_100g: Joi.number().min(0).max(100).optional(),
  fiber_per_100g: Joi.number().min(0).max(100).optional(),
  sugar_per_100g: Joi.number().min(0).max(100).optional(),
  sodium_per_100g: Joi.number().min(0).max(10000).optional(),
  category: Joi.string().valid('grains', 'protein', 'vegetables', 'fruits', 'dairy', 'beverages', 'snacks', 'other').optional()
});

// User meal validation schemas
const userMealCreateSchema = Joi.object({
  food_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().min(0.1).max(10000).required(),
  meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
  consumed_at: Joi.date().optional()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query parameter validation error',
        errors: errors
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQueryParams,
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
  foodCreateSchema,
  foodUpdateSchema,
  userMealCreateSchema
};