const fetch = global.fetch || require('node-fetch');
const loginUrl = 'http://localhost:4000/api/auth/login';
const payload = { email: 'citizen@example.com', password: 'Password123' };
(async () => {
  try {
    const login = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const loginBody = await login.text();
    console.log('LOGIN', login.status, loginBody);
    if (login.status !== 200) return;
    const data = JSON.parse(loginBody);
    const token = data.token;
    const search = await fetch('http://localhost:4000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: '', statuses: ['Active'] }),
    });
    const searchBody = await search.text();
    console.log('SEARCH', search.status, searchBody);
  } catch (e) {
    console.error('ERR', e);
  }
})();
