// server.js
require('dotenv').config();
const express = require('express');
const path    = require('path');

const app      = express();
const PORT     = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY  = process.env.CLASH_API_KEY;

// 1) Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// 2) EJS templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3) Proxy metadata endpoints
['troops','heroes','spells'].forEach(type => {
  app.get(`/api/meta/${type}`, async (req, res) => {
    try {
      const r = await fetch(`${API_BASE}/metadata/${type}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      if (!r.ok) {
        const txt = await r.text();
        return res.status(r.status).send(txt);
      }
      res.json(await r.json());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

// 4) Player lookup
app.get('/api/player/:tag', async (req, res) => {
  try {
    const raw = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#' + raw);
    const r   = await fetch(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).send(txt);
    }
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 5) Render index
app.get('/', (req, res) => {
  res.render('index');
});

// 6) Launch
app.listen(PORT, () => {
  console.log(`🚀 Listening on http://localhost:${PORT}`);
});
