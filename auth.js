// Step 1 of the dashboard login: sends you to GitHub to sign in.
const crypto = require('crypto');

module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('GITHUB_CLIENT_ID is not set in Vercel.');
  }
  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', 'oauth_state=' + state + '; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600');
  const params = new URLSearchParams({ client_id: clientId, scope: 'repo', state });
  res.statusCode = 302;
  res.setHeader('Location', 'https://github.com/login/oauth/authorize?' + params.toString());
  res.end();
};
