require('dotenv').config();

const { app, initializeDatabase } = require('./app');
const config = require('./config/config');

// Start server
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the server
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log('\n🚀 Nutrition Management Server Started');
      console.log('=====================================');
      console.log(`📍 Environment: ${config.app.environment}`);
      console.log(`🌐 Server URL: http://${config.server.host}:${config.server.port}`);
      console.log(`🔗 API Base URL: http://${config.server.host}:${config.server.port}/api`);
      console.log(`📚 API Documentation: http://${config.server.host}:${config.server.port}/api`);
      console.log(`🏥 Health Check: http://${config.server.host}:${config.server.port}/health`);
      console.log('=====================================\n');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close database connections
        const { sequelize } = require('./config/database');
        sequelize.close().then(() => {
          console.log('✅ Database connections closed');
          console.log('👋 Server shut down gracefully');
          process.exit(0);
        }).catch((error) => {
          console.error('❌ Error closing database connections:', error);
          process.exit(1);
        });
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.log('⏰ Force shutdown after 10 seconds');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
if (require.main === module) {
  startServer();
}

module.exports = { startServer };