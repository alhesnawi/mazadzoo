const mongoose = require('mongoose');
const logger = require('./utils/logger');

const testConnection = async () => {
  try {
    logger.info('Testing MongoDB connection...');
    
    const mongoURI = 'mongodb+srv://m82basheer_db_user:Is0VTGFe65aPfFUo@mazadzoo.xfcsztq.mongodb.net/mazadzoo?retryWrites=true&w=majority&appName=mazadzoo';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    logger.info('Connection successful!', { host: conn.connection.host, database: conn.connection.name });
    
    await mongoose.disconnect();
    logger.info('Test completed successfully');
    
  } catch (error) {
    logger.error('Connection failed', { message: error.message });
  }
};

testConnection();