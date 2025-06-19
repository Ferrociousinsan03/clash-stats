require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');

const app      = express();
const PORT     = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY  = process.env.CLASH_API_KEY;

// Serve static files from public/
app.use(express.static('public'));

// Proxy metadata for troops
app.get('/api/meta/troops', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/metadata/troops`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy metadata for heroes
app.get('/api/meta/heroes', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/metadata/heroes`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Fetch a player by tag
app.get('/api/player/:tag', async (req, res) => {
  try {
    const rawTag = req.params.tag.replace(/^#/, '');
    const tag    = encodeURIComponent('#' + rawTag);
    const r      = await fetch(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: r.statusText });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
