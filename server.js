// server.js
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const API_TOKEN = process.env.COC_TOKEN; // from your .env

// 1) Static assets
app.use('/css',  express.static(path.join(process.cwd(), 'public', 'css')));
app.use('/js',   express.static(path.join(process.cwd(), 'public', 'js')));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

// 2) EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// 3) Render the dashboard page
app.get('/', (req, res) => {
  res.render('index');
});

// 4) Player data proxy
app.get('/api/player/:tag', async (req, res) => {
  const tag = encodeURIComponent(req.params.tag);
  const url = `https://api.clashofclans.com/v1/players/${tag}`;
  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: 'application/json'
      }
    });
    if (r.status === 404) return res.status(404).end();
    if (!r.ok) {
      console.error('Coc API error', await r.text());
      return res.sendStatus(500);
    }
    const player = await r.json();

    // Fetch the metadata for troops, spells & heroes
    const metaUrls = [
      'troops',
      'spells',
      'heroes'
    ].map(type => 
      fetch(`https://api.clashofclans.com/v1/metadata/${type}`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` }
      }).then(m => m.json())
    );

    const [troopMeta, spellMeta, heroMeta] = await Promise.all(metaUrls);

    // map the player.troops array to include name & level
    const troops = player.troops.map(t => ({
      name:   troopMeta.find(m=>m.id===t.name).name,
      level:  t.level
    }));

    const spells = player.spells.map(s => ({
      name:   spellMeta.find(m=>m.id===s.name).name,
      level:  s.level
    }));

    const heroes = player.heroes.map(h => ({
      name:   heroMeta.find(m=>m.id===h.name).name,
      level:  h.level
    }));

    res.json({
      townHallLevel: player.townHallLevel,
      troops,
      spells,
      heroes
    });

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
