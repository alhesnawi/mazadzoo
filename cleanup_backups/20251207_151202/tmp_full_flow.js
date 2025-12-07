const http = require('http');
const data = JSON.stringify({ email: 'testuser@example.com', password: 'Pass1234' });

function postLogin(cb) {
  const opts = { host: 'localhost', port: 5174, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
  const req = http.request(opts, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => cb(null, body));
  });
  req.on('error', e => cb(e));
  req.write(data);
  req.end();
}

function getMe(token, cb) {
  const opts = { host: 'localhost', port: 5174, path: '/api/auth/me', method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };
  const req = http.request(opts, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => cb(null, res.statusCode, body));
  });
  req.on('error', e => cb(e));
  req.end();
}

postLogin((err, body) => {
  if (err) return console.error('login err', err);
  try {
    const j = JSON.parse(body);
    const token = j.token;
    console.log('Login token:', token ? token.slice(0,20)+'...' : token);
    if (!token) return console.error('No token');
    getMe(token, (err, status, body) => {
      if (err) return console.error('me err', err);
      console.log('GET /me status', status);
      console.log('GET /me body', body);
    });
  } catch (e) { console.error('parse login response', e, body); }
});
