// simple DOM helper
const $ = s => document.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
  const btn   = $('#fetchBtn');
  const input = $('#tagInput');
  btn.addEventListener('click', () => {
    const raw = input.value.trim();
    if (!raw) return alert('Enter a player tag');
    fetchAll(encodeURIComponent(raw.replace(/^#/, '')));
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

function normalizeDash(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
function normalizeUnderscore(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

async function fetchAll(tag) {
  try {
    // Player data
    const pr = await fetch(`/api/player/${tag}`);
    if (!pr.ok) {
      const e = await pr.json();
      throw new Error(e.error || 'Player not found');
    }
    const stat = await pr.json();

    // Metadata
    const [tRaw, hRaw] = await Promise.all([
      fetch('/api/meta/troops').then(r => r.json()),
      fetch('/api/meta/heroes').then(r => r.json())
    ]);
    const troopsMeta = tRaw.items;
    const heroesMeta = hRaw.items;

    // Town Hall
    $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
    const thFile = `townhall_${stat.townHallLevel}.png`;
    $('#townhall .cards')
      .appendChild(makeCard(`/images/${thFile}`, `Town Hall L${stat.townHallLevel}`));

    // Troops
    $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
    stat.troops.forEach(t => {
      if (t.level > 0) {
        const file = normalizeDash(t.name) + '.png';
        $('#troops .cards')
          .appendChild(makeCard(`/images/${file}`, `${t.name} L${t.level}`));
      }
    });

    // Heroes
    $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
    stat.heroes.forEach(h => {
      if (h.level > 0) {
        const file = normalizeDash(h.name) + '.png';
        $('#heroes .cards')
          .appendChild(makeCard(`/images/${file}`, `${h.name} L${h.level}`));
      }
    });

    // Equipment
    $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
    if (stat.heroEquipment?.length) {
      stat.heroEquipment.forEach(eq => {
        const file = normalizeUnderscore(eq.name) + '.png';
        $('#equipment .cards')
          .appendChild(makeCard(`/images/${file}`, eq.name));
      });
    } else {
      $('#equipment .cards').innerHTML = '<p>No equipment</p>';
    }

  } catch (err) {
    alert(err.message);
  }
}
