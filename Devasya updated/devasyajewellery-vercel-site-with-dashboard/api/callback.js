// Step 2 of the dashboard login: GitHub sends you back here with a code.
// We swap it for a token and hand the token to the dashboard window.
function page(status, content) {
  const message = 'authorization:github:' + status + ':' + JSON.stringify(content);
  return '<!doctype html><html><body><script>(function(){' +
    'function receive(e){window.opener.postMessage(' + JSON.stringify(message) + ',e.origin);window.removeEventListener("message",receive,false);}' +
    'window.addEventListener("message",receive,false);' +
    'window.opener.postMessage("authorizing:github","*");' +
    '})();</script></body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const send = (status, content) => { res.statusCode = 200; res.end(page(status, content)); };
  try {
    const url = new URL(req.url, 'https://' + (req.headers.host || 'localhost'));
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookie = (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith('oauth_state='));
    const saved = cookie ? cookie.slice('oauth_state='.length) : '';
    if (!code || !state || !saved || state !== saved) return send('error', { message: 'Login could not be verified. Please try again.' });

    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    const data = await r.json();
    if (!data.access_token) return send('error', { message: data.error_description || data.error || 'GitHub did not give a token.' });
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0');
    return send('success', { token: data.access_token, provider: 'github' });
  } catch (err) {
    return send('error', { message: 'Login failed: ' + err.message });
  }
};
