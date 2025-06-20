const form  = document.getElementById('fetchForm');
const tagIn = document.getElementById('tagInput');
const byId  = id => document.getElementById(id);

function slug(s) {
  return s.toLowerCase()
          .replace(/[\s\.'’]/g,'-')
          .replace(/[^a-z0-9\-]/g,'')
          .replace(/\-+/g,'-');
}

function card(src, text) {
  const f = document.createElement('figure');
  f.innerHTML = `<img src="${src}" alt="${text}"><figcaption>${text}</figcaption>`;
  return f;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const tag = tagIn.value.trim();
  if (!tag) return;

  try {
    const res = await fetch(`/api/player/${tag}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Town Hall
    const th = byId('townhall');
    th.innerHTML = '';
    const lvl = data.townHallLevel;
    th.appendChild(card(`/townhall-l${lvl}.png`, `Town Hall L${lvl}`));

    // Troops
    const tr = byId('troops');
    tr.innerHTML = '';
    data.troops.forEach(t => {
      const name = slug(t.name);
      tr.appendChild(card(`/${name}.png`, `${t.name} L${t.level}`));
    });

    // Heroes
    const hr = byId('heroes');
    hr.innerHTML = '';
    data.heroes.forEach(h => {
      const name = slug(h.name);
      hr.appendChild(card(`/${name}.png`, `${h.name} L${h.level}`));
    });

    // Spells
    const sp = byId('spells');
    sp.innerHTML = '';
    data.spells.forEach(s => {
      const name = slug(s.name) + '-spell';
      sp.appendChild(card(`/${name}.png`, `${s.name} L${s.level}`));
    });

  } catch (err) {
    alert(err.message || 'Fetch error');
  }
});
