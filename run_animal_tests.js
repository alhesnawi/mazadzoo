const fs = require('fs');
const fetch = global.fetch || require('node-fetch');

const BASE = 'http://localhost:5000';

function readToken(path) {
  try {
    const txt = fs.readFileSync(path, 'utf8').trim();
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    // token is usually on the last line
    return lines[lines.length - 1];
  } catch (e) {
    return null;
  }
}

async function request(method, path, token, body) {
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body
  });
  let text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch (e) { return { status: res.status, body: text }; }
}

(async () => {
  const path = require('path');
  const sellerToken = readToken(path.join(__dirname, 'seller_token.txt'));
  const buyerToken = readToken(path.join(__dirname, 'buyer_token.txt'));
  const adminToken = readToken(path.join(__dirname, 'admin_token.txt'));

  console.log('Using tokens:', !!sellerToken, !!buyerToken, !!adminToken);

  console.log('\n1) GET /api/animals (list)');
  // Try several status filters to find any existing test animal
  const statusesToTry = ['pending', 'active', 'ended'];
  let list;
  let animals;
  for (const s of statusesToTry) {
    list = await request('GET', `/api/animals?status=${s}`, null);
    animals = list.body && list.body.data && list.body.data.animals;
    if (animals && animals.length) break;
  }
  // Fallback to unfiltered list
  if (!animals || animals.length === 0) {
    list = await request('GET', '/api/animals', null);
    animals = list.body && list.body.data && list.body.data.animals;
  }

  console.log(list.status, JSON.stringify(list.body, null, 2).slice(0, 4000));
  const firstId = animals && animals.length ? animals[0]._id || animals[0].id || animals[0]._doc?._id : null;
  if (!firstId) {
    console.error('No animals found to test.');
    process.exit(1);
  }

  console.log('\nUsing animal id:', firstId);

  console.log('\n2) GET /api/animals/:id');
  const getOne = await request('GET', `/api/animals/${firstId}`, null);
  console.log(getOne.status, JSON.stringify(getOne.body, null, 2).slice(0, 4000));

  console.log('\n3) PUT /api/animals/:id (update as seller)');
  const updateBody = { description: 'Updated by automated test - now includes more than ten chars', startPrice: 120 };
  const update = await request('PUT', `/api/animals/${firstId}`, sellerToken, updateBody);
  console.log(update.status, JSON.stringify(update.body, null, 2).slice(0, 4000));

  console.log('\n4) POST /api/animals/:id/start-auction (admin)');
  const start = await request('POST', `/api/animals/${firstId}/start-auction`, adminToken);
  console.log(start.status, JSON.stringify(start.body, null, 2).slice(0, 4000));

  console.log('\n5) POST /api/animals/:id/end-auction (admin)');
  const end = await request('POST', `/api/animals/${firstId}/end-auction`, adminToken);
  console.log(end.status, JSON.stringify(end.body, null, 2).slice(0, 4000));

  console.log('\n6) POST /api/animals/:id/watchlist (buyer)');
  const watchToggle = await request('POST', `/api/animals/${firstId}/watchlist`, buyerToken);
  console.log(watchToggle.status, JSON.stringify(watchToggle.body, null, 2).slice(0, 4000));

  console.log('\n7) GET /api/animals/watchlist (buyer)');
  const watchList = await request('GET', `/api/animals/watchlist`, buyerToken);
  console.log(watchList.status, JSON.stringify(watchList.body, null, 2).slice(0, 4000));

  console.log('\n8) DELETE /api/animals/:id (seller)');
  const del = await request('DELETE', `/api/animals/${firstId}`, sellerToken);
  console.log(del.status, JSON.stringify(del.body, null, 2).slice(0, 4000));

  console.log('\nDone');
  process.exit(0);
})();
