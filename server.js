// server.js
require('dotenv').config();
const express       = require('express');
const fetch         = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const app    = express();
const PORT   = process.env.PORT || 3000;
const API_BASE = 'https://api.clashofclans.com/v1';
const APIKEY   = process.env.CLASH_API_KEY;

// Supabase client (optional — only if you persisted data)
const supa = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Serve your static front-end (index.html + script.js + images)
app.use(express.static('public'));

// Proxy metadata endpoints so the browser can fetch icons
app.get('/api/meta/troops', async (req, res) => {
  const r = await fetch(`${API_BASE}/metadata/troops`, {
    headers: { Authorization: `Bearer ${APIKEY}` }
  });
  const j = await r.json();
  res.json(j);
});
app.get('/api/meta/heroes', async (req, res) => {
  const r = await fetch(`${API_BASE}/metadata/heroes`, {
    headers: { Authorization: `Bearer ${APIKEY}` }
  });
  const j = await r.json();
  res.json(j);
});

// Player endpoint
app.get('/api/player/:tag', async (req, res) => {
  try {
    const raw = req.params.tag.replace(/^#/, '');
    const tag = encodeURIComponent('#' + raw);
    const r   = await fetch(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${APIKEY}` }
    });
    if (!r.ok) return res.status(r.status).json({ error: r.statusText });
    const data = await r.json();

    // (Optional) upsert into Supabase here
    // await supa.from('clash_players').upsert({ tag, data });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
