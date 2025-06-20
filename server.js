// server.js
require('dotenv').config();
const express = require('express');
const path    = require('path');

const app      = express();
const PORT     = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY  = process.env.CLASH_API_KEY;

// Serve static
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper for proxying and ensuring JSON
async function proxyJson(url, apiKey, res) {
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || r.statusText };
    }
    return r.ok
      ? res.json(data)
      : res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// Metadata endpoints
['troops','heroes','spells'].forEach(type => {
  app.get(`/api/meta/${type}`, (req, res) => {
    return proxyJson(`${API_BASE}/metadata/${type}`, API_KEY, res);
  });
});

// Player lookup
app.get('/api/player/:tag', (req, res) => {
  const raw = req.params.tag.replace(/^#/, '');
  const tag = encodeURIComponent('#' + raw);
  return proxyJson(`${API_BASE}/players/${tag}`, API_KEY, res);
});

// Main page
app.get('/', (req, res) => {
  res.render('index');
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Listening on http://localhost:${PORT}`);
});
