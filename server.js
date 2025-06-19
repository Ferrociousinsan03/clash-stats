// at top, after your other requires
// no extra dependencies needed (we already have node-fetch)

// Proxy metadata for troops and heroes
app.get('/api/meta/troops', async (req, res) => {
  const r = await fetch(`${API_BASE}/metadata/troops`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const j = await r.json();
  res.json(j);
});

app.get('/api/meta/heroes', async (req, res) => {
  const r = await fetch(`${API_BASE}/metadata/heroes`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const j = await r.json();
  res.json(j);
});
