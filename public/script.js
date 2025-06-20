document.getElementById('player-form').addEventListener('submit', async e => {
  e.preventDefault();
  const tag = document.getElementById('tag-input').value.trim();
  if (!tag) return alert('Enter a tag.');

  // clear
  for (let id of ['townhall-container','troops-container','heroes-container','spells-container']) {
    document.getElementById(id).innerHTML = '';
  }

  try {
    let { data } = await fetch(`/api/player/${tag}`).then(r => r.json());

    // Town Hall
    const th = document.createElement('div');
    th.className = 'card';
    let lvl = data.townHallLevel;
    th.innerHTML = `
      <img src="/townhalls/townhall-l${lvl}.png" />
      <p>Town Hall L${lvl}</p>
    `;
    document.getElementById('townhall-container').appendChild(th);

    // Troops
    data.troops.forEach(t => {
      let key = t.name.toLowerCase().replace(/\s+/g,'-');
      let d   = document.createElement('div');
      d.className = 'card';
      d.innerHTML = `
        <img src="/troops/${key}.png" />
        <p>${t.name} L${t.level}</p>
      `;
      document.getElementById('troops-container').appendChild(d);
    });

    // Heroes
    data.heroes.forEach(h => {
      let key = h.name.toLowerCase().replace(/\s+/g,'-');
      let d   = document.createElement('div');
      d.className = 'card';
      d.innerHTML = `
        <img src="/heroes/${key}.png" />
        <p>${h.name} L${h.level}</p>
      `;
      document.getElementById('heroes-container').appendChild(d);
    });

    // Spells
    data.spells.forEach(s => {
      let key = s.name.toLowerCase().replace(/\s+/g,'-');
      let d   = document.createElement('div');
      d.className = 'card';
      d.innerHTML = `
        <img src="/spells/${key}.png" />
        <p>${s.name} L${s.level}</p>
      `;
      document.getElementById('spells-container').appendChild(d);
    });

  } catch (err) {
    alert(err.error || 'Failed to fetch');
  }
});
