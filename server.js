// server.js
require('dotenv').config();
const express = require('express');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({default:f})=>f(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.SUPERCELL_TOKEN;
if (!TOKEN) {
  console.error('❌  SUPERCELL_TOKEN missing in .env');
  process.exit(1);
}

// 1) Point at your EJS folder named "veiw"
app.set('views', path.join(__dirname, 'veiw'));
app.set('view engine', 'ejs');

// 2) Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// 3) Render your homepage (veiw/index.ejs)
app.get('/', (req, res) => res.render('index'));

// 4) Clash player endpoint
app.get('/api/player/:tag', async (req, res) => {
  try {
    let tag = req.params.tag.trim();
    if (!tag.startsWith('#')) tag = `#${tag}`;
    const url = `https://api.clashofclans.com/v1/players/${encodeURIComponent(tag)}`;
    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept:        'application/json',
      },
    });
    if (apiRes.status === 404) {
      return res.status(404).json({ error: 'Player not found' });
    }
    if (!apiRes.ok) {
      const txt = await apiRes.text();
      console.error(`🔥 API error (${apiRes.status}):`, txt);
      return res.status(apiRes.status).json({ error: 'Clash API error' });
    }
    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error('💥 Internal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
