// server.js
require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');

const app      = express();
const PORT     = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY  = process.env.CLASH_API_KEY;

// 1) Serve your front‐end
app.use(express.static('public'));

// 2) Metadata routes (troops & heroes)
app.get('/api/meta/troops', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/metadata/troops`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const j = await r.json();
    res.json(j);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/meta/heroes', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/metadata/heroes`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const j = await r.json();
    res.json(j);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3) Player lookup
app.get('/api/player/:tag', async (req, res) => {
  try {
    const raw = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#' + raw);
    const r   = await fetch(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
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
});

// 4) Start listening
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
