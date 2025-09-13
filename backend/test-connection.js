const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    const mongoURI = 'mongodb+srv://m82basheer_db_user:Is0VTGFe65aPfFUo@mazadzoo.xfcsztq.mongodb.net/mazadzoo?retryWrites=true&w=majority&appName=mazadzoo';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connection successful!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();