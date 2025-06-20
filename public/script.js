const $ = s => document.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
  $('#fetchBtn').onclick = () => {
    const raw = $('#tagInput').value.trim();
    if (!raw) return alert('Please enter a player tag');
    const tag = raw.replace(/^#/, '').toUpperCase();
    fetchAll(tag);
  };
});

async function fetchAll(tag) {
  try {
    // 1) fetch player
    let r = await fetch(`/api/player/${tag}`);
    let text = await r.text();
    if (!r.ok) throw new Error(`Player ⇢ ${r.status} ${text}`);
    const player = JSON.parse(text);

    // 2) fetch metadata in parallel
    const [ troopsMeta, heroesMeta, spellsMeta ] = await Promise.all([
      fetchMeta('troops'),
      fetchMeta('heroes'),
      fetchMeta('spells'),
    ]);

    // 3) render everything
    renderTownHall(player.townHallLevel);
    renderList('troop-container', player.troops, troopsMeta);
    renderList('hero-container',  player.heroes, heroesMeta);
    renderList('spell-container', player.spells, spellsMeta);

  } catch (e) {
    alert(e.message);
    console.error(e);
  }
}

async function fetchMeta(type) {
  let r = await fetch(`/api/meta/${type}`);
  let text = await r.text();
  if (!r.ok) throw new Error(`Meta ${type} ⇢ ${r.status} ${text}`);
  return JSON.parse(text);
}

function renderTownHall(level) {
  const cnt = $('#th-container');
  cnt.innerHTML = '';
  const slug = `town-hall-${level}`;
  const img  = `/images/${slug}.png`;
  cnt.appendChild(card(slug.replace('-', ' ').toUpperCase(), `Town Hall L${level}`, img));
}

function renderList(containerId, arr, meta) {
  const cnt = $(`#${containerId}`);
  cnt.innerHTML = '';
  arr.forEach(item => {
    const info = meta.find(m => m.name === item.name);
    const slug = info ? info.name.toLowerCase().replace(/\s+/g,'-') : 'unknown';
    const img  = `/images/${slug}.png`;
    cnt.appendChild(card(slug, `${item.name} L${item.level}`, img));
  });
}

function card(id, label, imgSrc) {
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `<img src="${imgSrc}" alt="${id}" onerror="this.src='/images/placeholder.png'"/>
                 <div>${label}</div>`;
  return d;
}
