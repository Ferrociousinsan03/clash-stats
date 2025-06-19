// server.js
require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');

const app      = express();
const PORT     = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY  = process.env.CLASH_API_KEY;

// Serve static files from /public
app.use(express.static('public'));

// Proxy the metadata endpoints so the browser can access icon URLs
async function proxy(path, res) {
  try {
    const r = await fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json'
      }
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt || r.statusText });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
app.get('/api/meta/troops', (req, res) => proxy('/metadata/troops', res));
app.get('/api/meta/heroes', (req, res) => proxy('/metadata/heroes', res));

// Fetch player by tag
app.get('/api/player/:tag', async (req, res) => {
  try {
    const raw = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#' + raw);
    const r   = await fetch(`${API_BASE}/players/${tag}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json'
      }
    });
    if (!r.ok) {
      // forward the status and message
      const msg = await r.text();
      return res.status(r.status).json({ error: msg || r.statusText });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Listening on ${PORT}`));
