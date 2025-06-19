// server.js
require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');

const app      = express();
const PORT     = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY  = process.env.CLASH_API_KEY;

// serve the front-end
app.use(express.static('public'));

// player endpoint
app.get('/api/player/:tag', async (req, res) => {
  try {
    const raw = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#'+ raw);
    const r   = await fetch(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text||r.statusText });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, ()=>console.log(`🚀 listening ${PORT}`));
