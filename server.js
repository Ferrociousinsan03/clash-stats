require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const path    = require('path');

const app      = express();
const PORT     = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY  = process.env.CLASH_API_KEY;

// 1) Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// 2) EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3) Metadata routes
app.get('/api/meta/troops', async (req, res) => {
  const r = await fetch(`${API_BASE}/metadata/troops`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  res.json(await r.json());
});

app.get('/api/meta/heroes', async (req, res) => {
  const r = await fetch(`${API_BASE}/metadata/heroes`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  res.json(await r.json());
});

// 4) Player lookup route
app.get('/api/player/:tag', async (req, res) => {
  try {
    const raw = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#' + raw);
    const r   = await fetch(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text || r.statusText });
    }
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 5) Render the main page
app.get('/', (req, res) => {
  res.render('index');
});

// 6) Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
