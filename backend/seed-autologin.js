/*
  seed-autologin.js
  Logs in as admin and posts the sample policies and schemes via the API.
  Usage: node seed-autologin.js
  Make sure the backend server is running (npm run dev) and admin user exists (seed.js creates admin@policygpt.gov.in).
*/

const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 4000;
const ADMIN_EMAIL = 'admin@policygpt.gov.in';
const ADMIN_PASSWORD = 'Password123';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch (e) { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function login() {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  const payload = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
  const res = await request(options, payload);
  if (res.status === 200 && res.body && res.body.token) return res.body.token;
  if (res.body && res.body.token) return res.body.token;
  throw new Error('Login failed: ' + JSON.stringify(res));
}

function postWithToken(path, token, data) {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: `/api${path}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  return request(options, data);
}

const policies = require('./seed-data-payloads').policies;
const schemes = require('./seed-data-payloads').schemes;

async function run() {
  console.log('Logging in as admin...');
  const token = await login();
  console.log('Got token. Seeding policies...');

  for (let i = 0; i < policies.length; i++) {
    const p = policies[i];
    try {
      const r = await postWithToken('/policies', token, p);
      console.log(`Policy ${i+1}: status=${r.status}`);
    } catch (err) {
      console.error('Policy create error', err);
    }
  }

  console.log('Seeding schemes...');
  for (let i = 0; i < schemes.length; i++) {
    const s = schemes[i];
    try {
      const r = await postWithToken('/schemes', token, s);
      console.log(`Scheme ${i+1}: status=${r.status}`);
    } catch (err) {
      console.error('Scheme create error', err);
    }
  }

  console.log('Seeding complete. Verify in the UI.');
}

run().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
