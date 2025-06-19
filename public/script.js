// public/script.js

// 1) Define $ globally
const $ = selector => document.querySelector(selector);

// 2) Wait for DOM to be ready before binding
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, binding Fetch button');

  const btn = $('#fetchBtn');
  const input = $('#tagInput');

  if (!btn || !input) {
    console.error('Missing #fetchBtn or #tagInput');
    return;
  }

  btn.addEventListener('click', () => {
    console.log('Fetch clicked');
    const raw = input.value.trim();
    if (!raw) {
      return alert('Enter a player tag (no #)');
    }
    const tag = encodeURIComponent(raw.replace(/^#/, ''));
    fetchAll(tag).catch(e => {
      console.error(e);
      alert(e.message);
    });
  });
});


// 3) fetchAll remains as before:
async function fetchAll(tag) {
  console.log('Fetching player', tag);

  // Fetch player data
  const p = await fetch(`/api/player/${tag}`);
  if (!p.ok) {
    const err = await p.json();
    throw new Error(err.error || 'Player not found');
  }
  const stat = await p.json();

  // Fetch metadata
  const [tRaw, hRaw] = await Promise.all([
    fetch('/api/meta/troops').then(r => r.json()),
    fetch('/api/meta/heroes').then(r => r.json())
  ]);
  const troopsMeta = tRaw.items;
  const heroesMeta = hRaw.items;

  // Town Hall
  $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
  const thUrl = `https://api-assets.clashofclans.com/townhalls/town_hall_${stat.townHallLevel}.png`;
  $('#townhall .cards').appendChild(makeCard(thUrl, `Town Hall L${stat.townHallLevel}`));

  // Troops
  $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
  stat.troops.forEach(t => {
    if (t.level > 0) {
      const def = troopsMeta.find(x => x.name === t.name);
      const icon = def?.iconUrls?.small || '';
      $('#troops .cards').appendChild(makeCard(icon, `${t.name} L${t.level}`));
    }
  });

  // Heroes
  $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
  stat.heroes.forEach(h => {
    if (h.level > 0) {
      const def = heroesMeta.find(x => x.name === h.name);
      const icon = def?.iconUrls?.small || '';
      $('#heroes .cards').appendChild(makeCard(icon, `${h.name} L${h.level}`));
    }
  });

  // Equipment
  $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
  if (stat.heroEquipment?.length) {
    stat.heroEquipment.forEach(eq => {
      const norm = eq.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const url  = `https://api-assets.clashofclans.com/equipment/${norm}.png`;
      $('#equipment .cards').appendChild(makeCard(url, eq.name));
    });
  } else {
    $('#equipment .cards').innerHTML = '<p>No equipment</p>';
  }
}

// 4) helper to create a card
function makeCard(img, label) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `<img src="${img}" onerror="this.src='';" alt="${label}" /><p>${label}</p>`;
  return d;
}
