document.getElementById('playerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const tag = document.getElementById('playerTag').value.trim();
  const result = document.getElementById('result');
  result.innerHTML = '<p>Loading…</p>';

  try {
    const res = await fetch('/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag })
    });
    const data = await res.json();

    if (res.status !== 200) {
      result.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    let html = `
      <h2>${data.name} (Level ${data.expLevel})</h2>
      <p>Clan: ${data.clan}</p>
      <img src="${data.townHallImage}" alt="Town Hall Level ${data.townHallLevel}" />
      <p>Town Hall Level: ${data.townHallLevel}</p>

      <h3>Troops</h3>
      <div class="grid">${generateCards(data.troops)}</div>

      <h3>Heroes</h3>
      <div class="grid">${generateCards(data.heroes)}</div>

      <h3>Spells</h3>
      <div class="grid">${generateCards(data.spells)}</div>
    `;
    result.innerHTML = html;

  } catch {
    result.innerHTML = `<p class="error">Something went wrong.</p>`;
  }
});

function generateCards(items) {
  return items.map(item => `
    <div class="card">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='placeholder.png'">
      <p><strong>${item.name}</strong></p>
      <p>Level ${item.level}</p>
    </div>
  `).join('');
}
