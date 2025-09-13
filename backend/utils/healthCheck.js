// ملف جديد لمراقبة صحة قاعدة البيانات
const mongoose = require('mongoose');

const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state],
      connected: state === 1
    };
  } catch (error) {
    return {
      status: 'error',
      connected: false,
      error: error.message
    };
  }
};

module.exports = { checkDatabaseHealth };