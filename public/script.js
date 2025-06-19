// public/script.js

const $ = s => document.querySelector(s);

// build an icon+label card
function makeCard(img, label) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `
    <img src="${img}" onerror="this.src='';" alt="${label}" />
    <p>${label}</p>
  `;
  return d;
}

// normalize: "Ice Wizard" -> "ice-wizard"
function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function fetchAll(tag) {
  // 1) fetch the player JSON
  const res = await fetch(`/api/player/${tag}`);
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Player not found');
  }
  const stats = await res.json();

  // — Town Hall —
  $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
  const thImg = `https://api-assets.clashofclans.com/townhalls/town_hall_${stats.townHallLevel}.png`;
  $('#townhall .cards').appendChild(
    makeCard(thImg, `Town Hall L${stats.townHallLevel}`)
  );

  // — Troops —
  $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
  stats.troops.forEach(t => {
    if (t.level > 0) {
      const url = `https://api-assets.clashofclans.com/troops/${normalize(t.name)}.png`;
      $('#troops .cards').appendChild(makeCard(url, `${t.name} L${t.level}`));
    }
  });

  // — Heroes —
  $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
  stats.heroes.forEach(h => {
    if (h.level > 0) {
      const url = `https://api-assets.clashofclans.com/heroes/${normalize(h.name)}.png`;
      $('#heroes .cards').appendChild(makeCard(url, `${h.name} L${h.level}`));
    }
  });

  // — Equipment —
  $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
  if (stats.heroEquipment?.length) {
    stats.heroEquipment.forEach(eq => {
      const url = `https://api-assets.clashofclans.com/equipment/${normalize(eq.name)}.png`;
      $('#equipment .cards').appendChild(makeCard(url, eq.name));
    });
  } else {
    $('#equipment .cards').innerHTML = '<p>No equipment</p>';
  }
}

$('#fetchBtn').onclick = () => {
  const raw = $('#tagInput').value.trim();
  if (!raw) return alert('Enter a player tag');
  const tag = encodeURIComponent(raw.replace(/^#/, ''));
  fetchAll(tag).catch(e => alert(e.message));
};
