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
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function fetchAll(tag) {
  const res = await fetch(`/api/player/${tag}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Player not found');
  }
  const st = await res.json();

  // Town Hall
  $('#townhall').innerHTML = '<h2>Town Hall</h2><div class="cards"></div>';
  // CDN URL: /townhalls/town_hall_14.png  etc
  const thUrl = `https://api-assets.clashofclans.com/townhalls/town_hall_${st.townHallLevel}.png`;
  $('#townhall .cards').appendChild(
    makeCard(thUrl, `Town Hall L${st.townHallLevel}`)
  );

  // Troops
  $('#troops').innerHTML = '<h2>Troops</h2><div class="cards"></div>';
  st.troops.forEach(t => {
    if (t.level > 0) {
      const url = `https://api-assets.clashofclans.com/troops/${normalize(t.name)}.png`;
      $('#troops .cards').appendChild(
        makeCard(url, `${t.name} L${t.level}`)
      );
    }
  });

  // Heroes
  $('#heroes').innerHTML = '<h2>Heroes</h2><div class="cards"></div>';
  st.heroes.forEach(h => {
    if (h.level > 0) {
      const url = `https://api-assets.clashofclans.com/heroes/${normalize(h.name)}.png`;
      $('#heroes .cards').appendChild(
        makeCard(url, `${h.name} L${h.level}`)
      );
    }
  });

  // Equipment
  $('#equipment').innerHTML = '<h2>Equipment</h2><div class="cards"></div>';
  if (st.heroEquipment?.length) {
    st.heroEquipment.forEach(eq => {
      const url = `https://api-assets.clashofclans.com/equipment/${normalize(eq.name)}.png`;
      $('#equipment .cards').appendChild(
        makeCard(url, eq.name)
      );
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
