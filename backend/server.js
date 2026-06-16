const express = require('express');
const cors = require('cors');
const scraper = require('./scraper.js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Jalur data ongoing
app.get('/api/ongoing', async (req, res) => {
  try { const data = await scraper.ongoingList(); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Jalur data populer
app.get('/api/popular', async (req, res) => {
  try { const data = await scraper.popularSeries(); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Jalur data jadwal
app.get('/api/jadwal', async (req, res) => {
  try { const data = await scraper.jadwalRilis(); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Jalur pencarian anime
app.get('/api/search', async (req, res) => {
  try { const data = await scraper.search(req.query.q); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Jalur detail anime
app.get('/api/anime', async (req, res) => {
  try { const data = await scraper.animeDetail(req.query.url); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Jalur link streaming & download episode
app.get('/api/episode', async (req, res) => {
  try { const data = await scraper.episodeDetail(req.query.url); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`Server Jembatan API aktif di http://localhost:${PORT}`));
