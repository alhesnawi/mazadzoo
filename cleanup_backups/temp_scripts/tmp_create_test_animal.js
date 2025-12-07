const fetch = global.fetch || require('node-fetch');
const fs = require('fs');

const BASE = 'http://localhost:5000';

async function req(method, path, token, body) {
  const h = { 'Accept': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) h['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, {
    method, headers: h,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body
  });
  let txt = await res.text();
  try { return { status: res.status, body: JSON.parse(txt) }; } catch (e) { return { status: res.status, body: txt }; }
}

function readToken(p) {
  try {
    const txt = fs.readFileSync(p, 'utf8').trim();
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines[lines.length - 1];
  } catch (e) { return null; }
}

(async () => {
  const path = require('path');
  const tokenPath = path.join(__dirname, 'seller_token.txt');
  const sellerToken = readToken(tokenPath);
  console.log('Seller token:', sellerToken ? 'Found' : 'Missing');

  // Create a test animal
  const createRes = await req('POST', '/api/animals', sellerToken, {
    nameArabic: 'اختبار الحيوان',
    nameEnglish: 'Test Animal',
    description: 'Test animal for verification suite',
    category: 'birds',
    age: 5,
    health: 'excellent',
    weight: 2.5,
    color: 'brown',
    startPrice: 100,
    images: [],
    documents: []
  });

  console.log('Create animal:', createRes.status);
  if (createRes.body && createRes.body.data) {
    console.log('Animal ID:', createRes.body.data._id);
  } else {
    console.log('Response:', JSON.stringify(createRes.body, null, 2).slice(0, 500));
  }
})();
