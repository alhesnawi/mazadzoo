const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config();

const connectDB = async (retries = 5) => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI) {
    logger.error('Mongo URI not found in .env file');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority',
      bufferCommands: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      host: conn.connection.host,
      database: conn.connection.name
    });

    // Event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Database connection error:', {
      error: error.message,
      stack: error.stack,
      retries
    });

    if (retries > 0) {
      logger.info(`Retrying database connection... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      logger.error('Failed to connect to database after all retries');
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        logger.info('Running without database for testing...');
      }
    }
  }
};

module.exports = connectDB;

