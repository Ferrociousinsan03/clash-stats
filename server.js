require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const path    = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const TOKEN = process.env.CLASH_TOKEN;
const API_BASE = 'https://api.clashofclans.com/v1';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// serve your public folder
app.use('/css',  express.static(path.join(__dirname, 'public/css')));
app.use('/js',   express.static(path.join(__dirname, 'public/js')));
app.use('/townhalls', express.static(path.join(__dirname, 'public/townhalls')));
app.use('/troops',    express.static(path.join(__dirname, 'public/troops')));
app.use('/heroes',    express.static(path.join(__dirname, 'public/heroes')));
app.use('/spells',    express.static(path.join(__dirname, 'public/spells')));

// render the page
app.get('/', (req, res) => {
  res.render('index');
});

// proxy player endpoint
app.get('/api/player/:tag', async (req, res) => {
  try {
    const tag = encodeURIComponent('#' + req.params.tag);
    const resp = await axios.get(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    res.json(resp.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: 'Player not found' });
  }
});

// proxy meta endpoints
app.get('/api/meta/troops', async (req, res) => {
  const resp = await axios.get(`${API_BASE}/locations/57000000/rankings/players`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  res.json(resp.data);
});

// (you can add others: /api/meta/heroes, /api/meta/spells...)

app.listen(PORT, () => {
  console.log(`📡 Listening on port ${PORT}`);
});
