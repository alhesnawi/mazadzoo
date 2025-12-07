const config = require('./config/environment');
console.log('JWT_SECRET:', config.JWT_SECRET);
console.log('Length:', config.JWT_SECRET.length);
