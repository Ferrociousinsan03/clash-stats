// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, binding click handler');

  const $ = s => document.querySelector(s);
  const fetchBtn = $('#fetchBtn');
  const tagInput = $('#tagInput');

  if (!fetchBtn || !tagInput) {
    console.error('Could not find #fetchBtn or #tagInput in the DOM');
    return;
  }

  fetchBtn.addEventListener('click', () => {
    console.log('Fetch button clicked');
    const raw = tagInput.value.trim();
    if (!raw) {
      return alert('Please enter a player tag (without the #)');
    }
    const tag = encodeURIComponent(raw.replace(/^#/, ''));
    fetchAll(tag).catch(err => {
      console.error('fetchAll error:', err);
      alert(err.message);
    });
  });
});


function makeCard(img, label) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `<img src="${img}" onerror="this.src='';" alt="${label}" /><p>${label}</p>`;
  return d;
}

async function fetchAll(tag) {
  console.log('Calling /api/player/', tag);
  // 1) fetch player
  const p = await fetch(`/api/player/${tag}`);
  if (!p.ok) {
    const err = await p.json();
    throw new Error(err.error || 'Player not found');
  }
  const stat = await p.json();

  // 2) fetch metadata
  const [troopsMetaRaw, heroesMetaRaw] = await Promise.all([
    fetch('/api/meta/troops').then(r => r.json()),
    fetch('/api/meta/heroes').then(r => r.json())
  ]);
  const troopsMeta = troopsMetaRaw.items;
  const heroesMeta = heroesMetaRaw.items;

  // Town Hall
  $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
  const thUrl = `https://api-assets.clashofclans.com/townhalls/town_hall_${stat.townHallLevel}.png`;
  $('#townhall .cards').appendChild(makeCard(thUrl, `Town Hall L${stat.townHallLevel}`));

  // Troops
  $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
  stat.troops.forEach(t => {
    if (t.level > 0) {
      const def  = troopsMeta.find(x => x.name === t.name);
      const icon = def?.iconUrls?.small || '';
      $('#troops .cards').appendChild(makeCard(icon, `${t.name} L${t.level}`));
    }
  });

  // Heroes
  $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
  stat.heroes.forEach(h => {
    if (h.level > 0) {
      const def  = heroesMeta.find(x => x.name === h.name);
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
