// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const API_KEY = process.env.CLASH_API_KEY;

// Serve static files from /public
app.use(express.static('public'));

// Helper to call Supercell API
async function clashFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Status ${res.status}: ${res.statusText}`);
  return res.json();
}

// Fetch player by tag (without the leading "#")
app.get('/api/player/:tag', async (req, res) => {
  try {
    const rawTag = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#' + rawTag);
    const data = await clashFetch(`/players/${tag}`);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch clan by tag
app.get('/api/clan/:tag', async (req, res) => {
  try {
    const rawTag = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#' + rawTag);
    const data = await clashFetch(`/clans/${tag}`);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
