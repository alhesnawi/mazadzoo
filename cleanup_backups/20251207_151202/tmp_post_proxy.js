const http = require('http');
const data = JSON.stringify({ email: 'testuser@example.com', password: 'Pass1234' });
const opts = {
  host: 'localhost',
  port: 5174,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('BODY', body));
});
req.on('error', e => console.error('ERR', e));
req.write(data);
req.end();
