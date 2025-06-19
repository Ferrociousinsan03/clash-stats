// public/script.js

const $ = s => document.querySelector(s);

function makeCard(img, label) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `
    <img src="${img}" onerror="this.src='';" alt="${label}" />
    <p>${label}</p>
  `;
  return d;
}

function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

async function fetchAll(tag) {
  // 1) get player
  const p = await fetch(`/api/player/${tag}`);
  if (!p.ok) {
    const err = await p.json();
    throw new Error(err.error || 'Unknown error');
  }
  const stats = await p.json();

  // 2) get metadata
  const [troopsMeta, heroesMeta] = await Promise.all([
    fetch('/api/meta/troops').then(r => r.json()),
    fetch('/api/meta/heroes').then(r => r.json())
  ]);

  // Town Hall
  $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
  $('#townhall .cards').appendChild(
    makeCard(
      `/images/townhalls/${stats.townHallLevel}.png`,
      `Town Hall L${stats.townHallLevel}`
    )
  );

  // Troops
  $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
  stats.troops.forEach(t => {
    if (t.level > 0) {
      const def  = troopsMeta.find(x => x.name === t.name);
      const icon = def?.iconUrls?.small || '';
      $('#troops .cards').appendChild(
        makeCard(icon, `${t.name} L${t.level}`)
      );
    }
  });

  // Heroes
  $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
  stats.heroes.forEach(h => {
    if (h.level > 0) {
      const def  = heroesMeta.find(x => x.name === h.name);
      const icon = def?.iconUrls?.small || '';
      $('#heroes .cards').appendChild(
        makeCard(icon, `${h.name} L${h.level}`)
      );
    }
  });

  // Equipment
  $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
  if (stats.heroEquipment?.length) {
    stats.heroEquipment.forEach(eq => {
      const img = `/images/equipment/${normalize(eq.name)}.png`;
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
  fetchAll(tag).catch(err => alert(err.message));
};
