# 🥗 Nutrition Management System

A comprehensive web-based nutrition tracking application built for Software Engineering students. This system allows users to track their daily food intake, monitor nutritional goals, and maintain a healthy lifestyle through intelligent meal planning and analysis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![MySQL](https://img.shields.io/badge/mysql-v8.0+-orange.svg)
![Status](https://img.shields.io/badge/status-Sprint%201%20Complete-success.svg)

## 🎯 Project Overview

This project is developed as part of Sprint 1 implementation for a nutrition management system, demonstrating full-stack web development skills using modern technologies. The system provides comprehensive nutrition tracking capabilities with a focus on Vietnamese cuisine alongside international foods.

### ✨ Key Features

- **🔐 User Authentication**: Secure registration and login with JWT tokens
- **📊 Nutrition Tracking**: Real-time calorie and macronutrient monitoring
- **🍎 Food Database**: Extensive database with Vietnamese and international foods
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎯 Goal Setting**: Personalized nutrition goals based on user profile
- **📈 Analytics**: Daily, weekly nutrition summaries and progress tracking
- **🔍 Smart Search**: Quick food search with autocomplete
- **🍽️ Meal Planning**: Organize meals by type (breakfast, lunch, dinner, snacks)

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript ES6+** - Interactive functionality and API integration
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js 4.x** - Web application framework
- **Sequelize ORM** - Database object-relational mapping
- **JWT Authentication** - Secure token-based authentication
- **Bcrypt** - Password hashing and security

### Database
- **MySQL 8.0+** - Relational database management
- **Database Migrations** - Version-controlled schema changes
- **Sample Data** - Pre-populated Vietnamese and international foods

### Development Tools
- **Joi** - Request validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MySQL 8.0 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tuanwq/docs_manage_nutrition.git
   cd docs_manage_nutrition
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Setup database**
   ```bash
   # Create the database
   mysql -u root -p
   CREATE DATABASE nutrition_management;
   exit

   # Run schema and seed data
   mysql -u root -p < database/schema.sql
   mysql -u root -p nutrition_management < database/seeds/foods_data.sql
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env file with your database credentials
   ```

5. **Start the application**
   ```bash
   # From root directory
   npm start
   # Or from backend directory
   cd backend && npm run dev
   ```

6. **Access the application**
   - Web Application: http://localhost:3000
   - API Documentation: http://localhost:3000/api
   - Health Check: http://localhost:3000/health

## 📁 Project Structure

```
nutrition-management/
├── frontend/
│   ├── public/                 # HTML pages
│   │   ├── index.html         # Landing page
│   │   ├── login.html         # Login page
│   │   ├── register.html      # Registration page
│   │   ├── dashboard.html     # Main dashboard
│   │   └── foods.html         # Food management
│   └── assets/
│       ├── css/               # Stylesheets
│       │   ├── style.css      # Main styles
│       │   ├── auth.css       # Authentication styles
│       │   └── dashboard.css  # Dashboard styles
│       ├── js/                # JavaScript files
│       │   ├── api.js         # API client
│       │   ├── auth.js        # Authentication logic
│       │   └── main.js        # Main application logic
│       └── images/            # Static images
├── backend/
│   ├── config/                # Configuration files
│   │   ├── config.js          # App configuration
│   │   └── database.js        # Database configuration
│   ├── controllers/           # Request handlers
│   │   ├── authController.js  # Authentication logic
│   │   ├── foodController.js  # Food management
│   │   └── userController.js  # User operations
│   ├── models/                # Database models
│   │   ├── User.js            # User model
│   │   ├── Food.js            # Food model
│   │   ├── UserMeal.js        # Meal tracking model
│   │   └── index.js           # Model associations
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── foods.js           # Food routes
│   │   └── users.js           # User routes
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # Authentication middleware
│   │   └── validation.js      # Input validation
│   ├── utils/                 # Utility functions
│   │   └── helpers.js         # Helper functions
│   ├── app.js                 # Express application
│   ├── server.js              # Server entry point
│   └── package.json           # Backend dependencies
├── database/
│   ├── migrations/            # Database migrations
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_foods.sql
│   │   └── 003_create_user_meals.sql
│   ├── seeds/                 # Sample data
│   │   └── foods_data.sql     # Sample food data
│   └── schema.sql             # Complete database schema
├── docs/                      # Documentation
│   ├── api-documentation.md   # API reference
│   ├── sprint1-tasks.md       # Sprint tasks and progress
│   └── database-design.md     # Database design document
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Root package configuration
└── README.md                  # This file
```

## 📚 API Documentation

The system provides RESTful APIs for all functionality. Key endpoints include:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Food Management
- `GET /api/foods` - List foods with pagination and filters
- `GET /api/foods/search` - Search foods by name
- `POST /api/foods` - Create new food (authenticated)
- `GET /api/foods/categories` - Get food categories

### User Operations
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/meals` - Log a meal
- `GET /api/users/nutrition` - Get daily nutrition summary
- `GET /api/users/statistics` - Get user statistics

For complete API documentation, visit `/api` endpoint or see [docs/api-documentation.md](docs/api-documentation.md).

## 🎨 User Interface

### Landing Page
- Modern hero section with feature highlights
- Responsive design that works on all devices
- Clear call-to-action for registration

### Authentication
- Secure login and registration forms
- Multi-step registration with optional profile details
- Real-time form validation and error handling

### Dashboard
- Daily nutrition overview with visual progress bars
- Meal tracking by type (breakfast, lunch, dinner, snacks)
- Quick food search and selection
- Recent activity feed

### Food Management
- Comprehensive food database with search and filters
- Grid and list view options
- Category-based organization
- Add, edit, and delete food items

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with 12 rounds
- **JWT Authentication**: Secure token-based sessions
- **Input Validation**: Comprehensive validation using Joi
- **SQL Injection Prevention**: Parameterized queries via Sequelize
- **CORS Protection**: Configured for secure cross-origin requests
- **Environment Variables**: Sensitive data stored securely

## 📊 Database Design

The system uses a well-structured MySQL database with three main tables:

- **Users**: User accounts and profile information
- **Foods**: Comprehensive nutrition database
- **User_Meals**: Meal tracking and consumption history

For detailed database design, see [docs/database-design.md](docs/database-design.md).

## 🧪 Testing

### Manual Testing
The application has been thoroughly tested for:
- User registration and authentication flows
- Food search and meal logging functionality
- Responsive design across different screen sizes
- API endpoint functionality and error handling

### Demo Account
For testing purposes, you can use:
- **Username**: `demo`
- **Password**: `demo123`

## 🚀 Deployment

### Production Considerations
- Set `NODE_ENV=production` in environment variables
- Update database credentials for production
- Configure CORS for production domains
- Implement database backups
- Set up monitoring and logging

### Environment Variables
Required environment variables (see `.env.example`):
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=nutrition_management
JWT_SECRET=your_jwt_secret
```

## 🎯 Sprint 1 Achievements

### ✅ Completed Features
- ✅ Complete user authentication system
- ✅ Comprehensive food database with 25+ sample foods
- ✅ Real-time nutrition tracking and calculations
- ✅ Responsive web design for all devices
- ✅ RESTful API with 15+ endpoints
- ✅ Professional UI/UX with modern design
- ✅ Database with proper relationships and indexes
- ✅ Security implementation (JWT, bcrypt, validation)

### 📈 Success Metrics
- **Backend APIs**: 15+ fully functional endpoints
- **Database**: Complete schema with sample data
- **Frontend**: 5 responsive pages with interactive features
- **Code Quality**: Modular, documented, and maintainable
- **Security**: Production-ready authentication and validation

## 🔄 Future Enhancements (Sprint 2+)

- [ ] **Advanced Analytics**: Weekly/monthly nutrition trends
- [ ] **Recipe Management**: Custom recipes and meal planning
- [ ] **Social Features**: Meal sharing and community features
- [ ] **Mobile App**: React Native or Progressive Web App
- [ ] **External Integration**: Fitness trackers and nutrition APIs
- [ ] **AI Recommendations**: Personalized nutrition suggestions
- [ ] **Barcode Scanning**: Quick food entry via camera
- [ ] **Export Features**: PDF reports and data export

## 👥 Contributing

This project is developed as an educational exercise for Software Engineering students. Contributions are welcome for:

1. Bug fixes and improvements
2. Additional food data (especially Vietnamese cuisine)
3. UI/UX enhancements
4. Performance optimizations
5. Documentation improvements

### Development Guidelines
1. Follow existing code structure and naming conventions
2. Ensure responsive design for all UI changes
3. Add appropriate error handling and validation
4. Update documentation for any API changes
5. Test thoroughly before submitting changes

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Development Team**: Software Engineering students, Year 4
- **Instructor**: For guidance and requirements specification
- **Vietnamese Food Data**: Based on local nutrition standards
- **Open Source Libraries**: Express.js, Sequelize, and other dependencies

## 📞 Support

For questions, issues, or suggestions:
- Create an issue in this repository
- Contact the development team
- Refer to the documentation in the `/docs` directory

---

**Project Status**: Sprint 1 Complete ✅  
**Version**: 1.0.0  
**Last Updated**: 2024-01-01  

Built with ❤️ by Software Engineering students