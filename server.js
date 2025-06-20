// server.js
require('dotenv').config();
const express = require('express');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const CLASH_TOKEN = process.env.SUPERCELL_TOKEN;

if (!CLASH_TOKEN) {
  console.error('ERROR: missing SUPERCELL_TOKEN in .env');
  process.exit(1);
}

// point Express at your misspelled "veiw" folder
app.set('views', path.join(__dirname, 'veiw'));
app.set('view engine', 'ejs');

// serve your static assets (script.js, style.css, images, etc)
app.use(express.static(path.join(__dirname, 'public')));

// homepage renders veiw/index.ejs
app.get('/', (req, res) => {
  res.render('index');
});

// API proxy to Clash of Clans
app.get('/api/player/:tag', async (req, res) => {
  try {
    let tag = req.params.tag.trim();
    if (!tag.startsWith('#')) tag = `#${tag}`;
    const url = `https://api.clashofclans.com/v1/players/${encodeURIComponent(tag)}`;

    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${CLASH_TOKEN}`,
        Accept:        'application/json'
      }
    });

    if (apiRes.status === 404) {
      return res.status(404).json({ error: 'Player not found' });
    }
    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error(`Clash API error ${apiRes.status}:`, text);
      return res.status(apiRes.status).json({ error: 'Clash API error' });
    }

    const data = await apiRes.json();
    res.json(data);

  } catch (err) {
    console.error('Internal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
