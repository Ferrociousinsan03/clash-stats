// front/public/script.js

const $ = s => document.querySelector(s);
function makeCard(img, label) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `
    <img src="${img}" onerror="this.src='';" alt="${label}">
    <p>${label}</p>
  `;
  return d;
}

async function fetchAll(tag) {
  // 1) Fetch player data
  const resp = await fetch(`/api/player/${tag}`);
  if (!resp.ok) throw new Error((await resp.json()).error || 'Player not found');
  const stat = await resp.json();

  // 2) Fetch metadata for troops & heroes
  const [troopMeta, heroMeta] = await Promise.all([
    fetch('/api/meta/troops').then(r=>r.json()),
    fetch('/api/meta/heroes').then(r=>r.json())
  ]);

  // — Town Hall —
  $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
  // Official CDN: https://api-assets.clashofclans.com/townhalls/town_hall_<level>.png
  const thUrl = `https://api-assets.clashofclans.com/townhalls/town_hall_${stat.townHallLevel}.png`;
  $('#townhall .cards').appendChild(makeCard(thUrl, `Town Hall L${stat.townHallLevel}`));

  // — Troops —
  $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
  stat.troops.forEach(t => {
    if (t.level > 0) {
      const def = troopMeta.find(x => x.name === t.name);
      const img = def?.iconUrls?.small || '';
      $('#troops .cards').appendChild(makeCard(img, `${t.name} L${t.level}`));
    }
  });

  // — Heroes —
  $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
  stat.heroes.forEach(h => {
    if (h.level > 0) {
      const def = heroMeta.find(x => x.name === h.name);
      const img = def?.iconUrls?.small || '';
      $('#heroes .cards').appendChild(makeCard(img, `${h.name} L${h.level}`));
    }
  });

  // — Equipment —
  $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
  if (stat.heroEquipment?.length) {
    stat.heroEquipment.forEach(eq => {
      // Official CDN: https://api-assets.clashofclans.com/equipment/<normalized>.png
      const norm = eq.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const img  = `https://api-assets.clashofclans.com/equipment/${norm}.png`;
      $('#equipment .cards').appendChild(makeCard(img, eq.name));
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
