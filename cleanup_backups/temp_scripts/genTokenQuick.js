const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('./config/environment');
require('dotenv').config();

const TOKEN_SECRET = config.JWT_SECRET;

// Hard-coded test users (won't query DB, just generate tokens)
const users = [
  { id: '69356b6d7b67c6a10e316f42', email: 'seller1@example.com', role: 'seller' },
  { id: '6934bd03986f946566534996', email: 'buyer1@example.com', role: 'buyer' },
  { id: '69356d16a204ccc2e8082735', email: 'admin1@example.com', role: 'admin' }
];

users.forEach(user => {
  const token = jwt.sign({ id: user.id }, TOKEN_SECRET, { expiresIn: '7d' });
  const fileName = user.role === 'seller' ? 'seller_token.txt' : user.role === 'buyer' ? 'buyer_token.txt' : 'admin_token.txt';
  const content = `${user.email} ${user.id}\n${token}`;
  require('fs').writeFileSync(fileName, content);
  console.log(`✅ ${fileName}: ${user.email}`);
});

console.log('Done');
process.exit(0);
