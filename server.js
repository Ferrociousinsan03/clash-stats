require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const KEY   = process.env.CLASH_API_KEY;
const BASE  = 'https://api.clashofclans.com/v1';

// -- 1) Static / public
app.use(express.static(path.join(__dirname, 'public')));

// -- 2) View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// -- 3) Proxy routes --

// player stats
app.get('/api/player/:tag', async (req, res) => {
  const tag = req.params.tag.toUpperCase();
  const url = `${BASE}/players/%23${encodeURIComponent(tag)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
  const txt = await r.text();
  if (!r.ok) {
    return res.status(r.status).json({ status:r.status, message: txt });
  }
  return res.json(JSON.parse(txt));
});

// metadata: troops / heroes / spells
app.get('/api/meta/:type', async (req, res) => {
  const { type } = req.params; // e.g. "troops", "heroes", "spells"
  const url = `${BASE}/metadata/${type}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
  const txt = await r.text();
  if (!r.ok) {
    return res.status(r.status).json({ status:r.status, message: txt });
  }
  // each metadata response has { items: [...] }
  const { items } = JSON.parse(txt);
  return res.json(items);
});

// home page
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => console.log(`🚀 listening on port ${PORT}`));
