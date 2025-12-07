const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const config = require('./config/environment');

const users = [
  { id: '6935b3ab7b11f66b67f8517a', email: 'testseller@example.com', role: 'seller' },
  { id: '6935b3ab7b11f66b67f8517f', email: 'testbuyer@example.com', role: 'buyer' },
  { id: '6935b3ab7b11f66b67f85181', email: 'testadmin@example.com', role: 'admin' }
];

users.forEach(user => {
  const token = jwt.sign({ id: user.id }, config.JWT_SECRET, { expiresIn: '7d' });
  const fileName = path.join(__dirname, '..', `${user.role}_token.txt`);
  const content = `${user.email} ${user.id}\n${token}`;
  fs.writeFileSync(fileName, content);
  console.log(`✅ ${user.role}_token.txt`);
});
