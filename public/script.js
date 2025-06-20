// public/script.js

const $ = s => document.querySelector(s);

// On load, bind button
document.addEventListener('DOMContentLoaded', () => {
  $('#fetchBtn').onclick = () => {
    const raw = $('#tagInput').value.trim();
    if (!raw) return alert('Enter player tag');
    fetchAll(raw.replace(/^#/, ''));
  };
});

// Make a card element
function makeCard(src, label) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `<img src="${src}" onerror="this.src='';" alt="${label}"><p>${label}</p>`;
  return d;
}

// Normalize strings
const dash  = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const under = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');

async function fetchAll(tag) {
  try {
    // 1) Player data
    let r = await fetch(`/api/player/${encodeURIComponent(tag)}`);
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(txt || 'Player fetch failed');
    }
    const stat = await r.json();

    // 2) Fetch metadata
    const [tRaw,hRaw,sRaw] = await Promise.all([
      fetch('/api/meta/troops').then(r=>r.json()),
      fetch('/api/meta/heroes').then(r=>r.json()),
      fetch('/api/meta/spells').then(r=>r.json())
    ]);
    const tm = tRaw.items, hm = hRaw.items, sm = sRaw.items;

    // Town Hall
    $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
    $('#townhall .cards').append(
      makeCard(`/images/townhall_${stat.townHallLevel}.png`, `TH L${stat.townHallLevel}`)
    );

    // Troops
    $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
    stat.troops.forEach(t => {
      if (t.level>0) {
        const def = tm.find(x=>x.name===t.name);
        const src = def?.iconUrls?.small || `/images/${dash(t.name)}.png`;
        $('#troops .cards').append(makeCard(src, `${t.name} L${t.level}`));
      }
    });

    // Heroes
    $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
    stat.heroes.forEach(h => {
      if (h.level>0) {
        const def = hm.find(x=>x.name===h.name);
        const src = def?.iconUrls?.small || `/images/${dash(h.name)}.png`;
        $('#heroes .cards').append(makeCard(src, `${h.name} L${h.level}`));
      }
    });

    // Spells
    $('#spells').innerHTML = '<h2>Spells</h2><div class="cards"></div>';
    stat.spells.forEach(s => {
      if (s.level>0) {
        const def = sm.find(x=>x.name===s.name);
        const src = def?.iconUrls?.small || `/images/${dash(s.name)}.png`;
        $('#spells .cards').append(makeCard(src, `${s.name} L${s.level}`));
      }
    });

    // Equipment
    $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
    if (stat.heroEquipment?.length) {
      stat.heroEquipment.forEach(eq => {
        $('#equipment .cards').append(
          makeCard(`/images/${under(eq.name)}.png`, eq.name)
        );
      });
    } else {
      $('#equipment .cards').innerHTML = '<p>No equipment</p>';
    }

  } catch (e) {
    alert(e.message);
    console.error(e);
  }
}
