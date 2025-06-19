require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.json());

// Generate slug from name
function slugify(name) {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

// Base URL for images from a reliable Clash of Clans asset repository
const IMAGE_BASE = 'https://raw.githubusercontent.com/arenclash/coc-assets/main/';

app.post('/player', async (req, res) => {
  try {
    const tag = req.body.tag?.replace('#', '').toUpperCase();
    const { data } = await axios.get(`https://api.clashofclans.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${process.env.COC_API_TOKEN}` }
    });

    // Map troops, heroes & spells with auto-generated image URLs
    const troops = (data.troops || []).map(t => ({
      name: t.name,
      level: t.level,
      image: `${IMAGE_BASE}troops/${slugify(t.name)}.png`
    }));
    const heroes = (data.heroes || []).map(h => ({
      name: h.name,
      level: h.level,
      image: `${IMAGE_BASE}heroes/${slugify(h.name)}.png`
    }));
    const spells = (data.spells || []).map(s => ({
      name: s.name,
      level: s.level,
      image: `${IMAGE_BASE}spells/${slugify(s.name)}.png`
    }));

    // Town Hall image
    const townHallImage = `${IMAGE_BASE}townhalls/th${data.townHallLevel}.png`;

    res.json({
      name: data.name,
      expLevel: data.expLevel,
      clan: data.clan?.name || 'No Clan',
      townHallLevel: data.townHallLevel,
      townHallImage,
      troops, heroes, spells
    });
  } catch (err) {
    res.status(400).json({ error: 'Player not found or API error.' });
  }
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
