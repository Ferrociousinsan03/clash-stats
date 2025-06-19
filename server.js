require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🟡 Your GitHub raw repo CDN path:
const IMAGE_BASE = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/';
const slugify = name => name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { player: null, error: null });
});

app.post('/player', async (req, res) => {
  const tag = req.body.tag?.replace('#', '').toUpperCase();
  if (!tag) return res.render('index', { player: null, error: 'Please enter a valid tag.' });

  try {
    const { data } = await axios.get(`https://api.clashofclans.com/v1/players/%23${tag}`, {
      headers: {
        Authorization: `Bearer ${process.env.COC_API_TOKEN}`
      }
    });

    const mapAssets = (items, folder) =>
      (items || []).map(item => ({
        name: item.name,
        level: item.level,
        image: `${IMAGE_BASE}${folder}/${slugify(item.name)}.png`
      }));

    const player = {
      name: data.name,
      expLevel: data.expLevel,
      clan: data.clan?.name || 'No Clan',
      townHallLevel: data.townHallLevel,
      townHallImage: `${IMAGE_BASE}townhalls/th${data.townHallLevel}.png`,
      troops: mapAssets(data.troops, 'troops'),
      heroes: mapAssets(data.heroes, 'heroes'),
      spells: mapAssets(data.spells, 'spells')
    };

    res.render('index', { player, error: null });

  } catch {
    res.render('index', { player: null, error: 'Player not found or API error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
