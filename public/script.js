// public/script.js

const $ = s => document.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
  $('#fetchBtn').addEventListener('click', () => {
    const tag = $('#tagInput').value.trim().replace(/^#/, '');
    if (!tag) return alert('Please enter a player tag.');
    fetchAll(tag);
  });
});

function makeCard(src, label) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `
    <img src="${src}" onerror="this.src='';" alt="${label}">
    <p>${label}</p>
  `;
  return d;
}

const dash = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const under = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || response.statusText);
  }
}

async function fetchAll(tag) {
  try {
    // 1) player
    let r = await fetch(`/api/player/${encodeURIComponent(tag)}`);
    if (!r.ok) {
      const err = await safeJson(r);
      throw new Error(err.error || 'Player not found');
    }
    const stat = await r.json();

    // 2) metadata
    const [tR, hR, sR] = await Promise.all([
      fetch('/api/meta/troops'),
      fetch('/api/meta/heroes'),
      fetch('/api/meta/spells')
    ]);

    if (!tR.ok || !hR.ok || !sR.ok) {
      const te = tR.ok ? null : await safeJson(tR);
      const he = hR.ok ? null : await safeJson(hR);
      const se = sR.ok ? null : await safeJson(sR);
      throw new Error(te?.error || he?.error || se?.error || 'Meta load error');
    }

    const troopsMeta = await tR.json();
    const heroesMeta = await hR.json();
    const spellsMeta = await sR.json();

    // --- Town Hall ---
    $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
    $('#townhall .cards').append(
      makeCard(`/images/townhall_${stat.townHallLevel}.png`, `TH L${stat.townHallLevel}`)
    );

    // --- Troops ---
    $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
    stat.troops.forEach(t => {
      if (t.level > 0) {
        const def = troopsMeta.items.find(x => x.name === t.name);
        const src = def?.iconUrls?.small || `/images/${dash(t.name)}.png`;
        $('#troops .cards').append(makeCard(src, `${t.name} L${t.level}`));
      }
    });

    // --- Heroes ---
    $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
    stat.heroes.forEach(h => {
      if (h.level > 0) {
        const def = heroesMeta.items.find(x => x.name === h.name);
        const src = def?.iconUrls?.small || `/images/${dash(h.name)}.png`;
        $('#heroes .cards').append(makeCard(src, `${h.name} L${h.level}`));
      }
    });

    // --- Spells ---
    $('#spells').innerHTML = '<h2>Spells</h2><div class="cards"></div>';
    stat.spells.forEach(s => {
      if (s.level > 0) {
        const def = spellsMeta.items.find(x => x.name === s.name);
        const src = def?.iconUrls?.small || `/images/${dash(s.name)}.png`;
        $('#spells .cards').append(makeCard(src, `${s.name} L${s.level}`));
      }
    });

    // --- Equipment ---
    $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
    if (stat.heroEquipment?.length) {
      stat.heroEquipment.forEach(eq => {
        const file = `/images/${under(eq.name)}.png`;
        $('#equipment .cards').append(makeCard(file, eq.name));
      });
    } else {
      $('#equipment .cards').innerHTML = '<p>No equipment</p>';
    }

  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}
