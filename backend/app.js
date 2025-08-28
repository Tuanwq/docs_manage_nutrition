const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import configuration and database
const config = require('./config/config');
const { testConnection, syncDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/foods');
const userRoutes = require('./routes/users');

// Import models to establish associations
require('./models');

// Create Express application
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date().toISOString(),
      environment: config.app.environment,
      version: config.app.version
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/users', userRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/dashboard.html'));
});

app.get('/foods', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/foods.html'));
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Nutrition Management API',
    data: {
      name: config.app.name,
      version: config.app.version,
      environment: config.app.environment,
      endpoints: {
        auth: {
          'POST /api/auth/register': 'Register new user',
          'POST /api/auth/login': 'Login user',
          'GET /api/auth/profile': 'Get user profile (protected)',
          'GET /api/auth/verify': 'Verify token (protected)'
        },
        foods: {
          'GET /api/foods': 'Get all foods with pagination',
          'GET /api/foods/search': 'Search foods by name',
          'GET /api/foods/categories': 'Get food categories',
          'GET /api/foods/category/:category': 'Get foods by category',
          'GET /api/foods/:id': 'Get food by ID',
          'POST /api/foods': 'Create new food (protected)',
          'PUT /api/foods/:id': 'Update food (protected)',
          'DELETE /api/foods/:id': 'Delete food (protected)'
        },
        users: {
          'PUT /api/users/profile': 'Update user profile (protected)',
          'POST /api/users/meals': 'Add meal to log (protected)',
          'GET /api/users/meals': 'Get meals by date (protected)',
          'GET /api/users/nutrition': 'Get daily nutrition summary (protected)',
          'PUT /api/users/meals/:mealId': 'Update meal (protected)',
          'DELETE /api/users/meals/:mealId': 'Delete meal (protected)',
          'GET /api/users/statistics': 'Get user statistics (protected)'
        }
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    data: {
      path: req.path,
      method: req.method
    }
  });
});

// 404 handler for frontend routes
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      details: error
    } : undefined
  });
});

// Database initialization
const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to database...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    console.log('🔄 Synchronizing database models...');
    await syncDatabase();
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

module.exports = { app, initializeDatabase };