// helper to select one element
const $ = sel => document.querySelector(sel);

// build a simple icon+label card
function makeCard(img, label) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <img src="${img}" onerror="this.src='';" alt="${label}" />
    <p>${label}</p>
  `;
  return div;
}

// normalize names into lowercase_underscore form
function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

async function fetchAll(tag) {
  // 1) get player stats
  const statsRes = await fetch(`/api/player/${tag}`);
  if (!statsRes.ok) throw new Error('Player not found');
  const stats = await statsRes.json();

  // 2) get metadata for troops & heroes in parallel
  const [troopDefs, heroDefs] = await Promise.all([
    fetch('/api/meta/troops').then(r => r.json()),
    fetch('/api/meta/heroes').then(r => r.json())
  ]);

  // render Town Hall
  const thDiv = $('#townhall');
  thDiv.innerHTML = '<h2>Town Hall</h2>';
  const thImg = `/images/townhalls/${stats.townHallLevel}.png`;
  thDiv.appendChild(makeCard(thImg, `Town Hall L ${stats.townHallLevel}`));

  // render Troops
  const trDiv = $('#troops');
  trDiv.innerHTML = '<h2>Troops</h2><div id="stats"></div>';
  stats.troops.forEach(t => {
    if (t.level > 0) {
      const def = troopDefs.find(x => x.name === t.name);
      const icon = def?.iconUrls?.small || '';
      trDiv.querySelector('#stats').appendChild(
        makeCard(icon, `${t.name} L${t.level}`)
      );
    }
  });

  // render Heroes
  const hrDiv = $('#heroes');
  hrDiv.innerHTML = '<h2>Heroes</h2><div id="stats"></div>';
  stats.heroes.forEach(h => {
    if (h.level > 0) {
      const def = heroDefs.find(x => x.name === h.name);
      const icon = def?.iconUrls?.small || '';
      hrDiv.querySelector('#stats').appendChild(
        makeCard(icon, `${h.name} L${h.level}`)
      );
    }
  });

  // render Equipment
  const eqDiv = $('#equipment');
  eqDiv.innerHTML = '<h2>Equipment</h2><div id="stats"></div>';
  if (stats.heroEquipment?.length) {
    stats.heroEquipment.forEach(eq => {
      // equipment metadata isn’t available via API, so fallback to local
      const src = `/images/equipment/${normalize(eq.name)}.png`;
      eqDiv.querySelector('#stats').appendChild(
        makeCard(src, eq.name)
      );
    });
  } else {
    eqDiv.querySelector('#stats').innerHTML = '<p>No equipment equipped</p>';
  }
}

// wire up the button
$('#fetchBtn').addEventListener('click', () => {
  const raw = $('#tagInput').value.trim();
  if (!raw) return alert('Please enter a player tag.');
  const tag = encodeURIComponent(raw.replace(/^#/, ''));
  fetchAll(tag).catch(err => alert(err.message));
});
