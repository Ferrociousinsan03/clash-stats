require('dotenv').config();
const express = require('express');
const path    = require('path');
const axios   = require('axios');

const app      = express();
const PORT     = process.env.PORT || 10000;
const TOKEN    = process.env.CLASH_TOKEN;
const API_BASE = 'https://api.clashofclans.com/v1';

// 1) view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2) serve public folder at root
app.use(express.static(path.join(__dirname, 'public')));

// 3) home page
app.get('/', (req, res) => res.render('index'));

// 4) proxy to Clash API
app.get('/api/player/:tag', async (req, res) => {
  try {
    const tag = encodeURIComponent('#' + req.params.tag);
    const { data } = await axios.get(`${API_BASE}/players/${tag}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: 'Player not found' });
  }
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
