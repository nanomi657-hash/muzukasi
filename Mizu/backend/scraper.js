const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { load } = require('cheerio');

const BASE = 'https://s13.nontonanimeid.boats';
const MIRROR = 'https://s2.kotakanimeid.link';
const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1',
];
const clean = s => (s||'').replace(/\s+/g,' ').trim();
let uaIdx = 0;

function request(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const ua = UAS[uaIdx++ % UAS.length];
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { 'User-Agent': ua, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'id-ID,id;q=0.9' },
      timeout: 15000,
    };
    const req = mod.request(options, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(request(res.headers.location, retries));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', e => {
      if (retries > 1) {
        setTimeout(() => resolve(request(url, retries - 1)), 1000 * (4 - retries));
      } else reject(e);
    });
    req.on('timeout', () => {
      req.destroy();
      if (retries > 1) {
        setTimeout(() => resolve(request(url, retries - 1)), 1000 * (4 - retries));
      } else reject(new Error('Timeout'));
    });
    req.end();
  });
}

function smartParse(html) {
  const $ = load(html);
  const items = [];
  const selectors = ['.as-anime-card', '.bsx a[href*="/anime/"]', 'article a[href*="/anime/"]', '.listupd a[href*="/anime/"]', '.animposx a[href*="/anime/"]'];
  for (const sel of selectors) {
    $(sel).each((i, el) => {
      const $el = $(el);
      const link = $el.is('a') ? $el.attr('href') : $el.find('a[href*="/anime/"]').first().attr('href');
      if (!link || !link.includes('/anime/')) return;
      const title = clean($el.find('.as-anime-title, h2, h3, h4, .tt, [class*=title]').first().text() || $el.text());
      const img = clean($el.find('img').attr('src') || '');
      const rating = clean(($el.find('.as-rating').text() || '').replace(/[⭐]/g,''));
      const type = clean(($el.find('.as-type').text() || '').replace(/[📺]/g,''));
      const season = clean(($el.find('.as-season').text() || '').replace(/[📅]/g,''));
      const synopsis = clean($el.find('.as-synopsis').text() || '');
      const url = link.startsWith('http') ? link : BASE + link;
      if (title && !items.find(it => it.url === url)) {
        const obj = { title, url, image: img };
        if (rating) obj.rating = rating;
        if (type) obj.type = type;
        if (season) obj.season = season;
        if (synopsis) obj.synopsis = synopsis;
        items.push(obj);
      }
    });
    if (items.length) break;
  }
  return items;
}

function parseOngoing(html) {
  const $ = load(html);
  const items = [];
  const selectors = ['.card-frame a[href*="/anime/"]', '.gacha-grid a[href*="/anime/"]', 'a[href*="/anime/"]'];
  for (const sel of selectors) {
    $(sel).each((i, el) => {
      const txt = clean($(el).text());
      if (!txt.includes('Ep.')) return;
      const link = $(el).attr('href');
      const img = clean($(el).find('img').attr('src') || '');
      const url = link.startsWith('http') ? link : BASE + link;
      if (!items.find(it => it.url === url)) items.push({ title: txt, url, image: img || undefined });
    });
    if (items.length) break;
  }
  return items;
}

function parsePopular(html) {
  const $ = load(html);
  const items = [];
  $('.animeseries a[href*="/anime/"]').each((i, el) => {
    const title = clean($(el).text());
    const link = $(el).attr('href');
    const img = clean($(el).parent().find('img').attr('src') || '');
    const url = link.startsWith('http') ? link : BASE + link;
    if (title) items.push({ title, url, image: img });
  });
  if (!items.length) items.push(...smartParse(html));
  return items;
}

function parseJadwal(html) {
  const items = smartParse(html);
  if (items.length) return items;
  const $ = load(html);
  $('.as-anime-card').each((i, el) => {
    const link = $(el).is('a') ? $(el).attr('href') : $(el).find('a[href*="/anime/"]').first().attr('href');
    if (!link || !link.includes('/anime/')) return;
    const title = clean($(el).find('.as-anime-title').text());
    const img = clean($(el).find('img').attr('src') || '');
    const url = link.startsWith('http') ? link : BASE + link;
    if (title) items.push({ title, url, image: img });
  });
  return items;
}

function parseDetail(html) {
  const $ = load(html);
  const title = clean($('title').text().replace(/ - Nonton Anime ID.*/, ''));
  const thumb = clean(
    $('img.wp-post-image').attr('src') ||
    $('img.size-full').attr('src') ||
    $('.thumb img').attr('src') ||
    $('.post-thumbnail img').attr('src') ||
    $('img[src*="uploads"]').not('[src*="Logo"]').not('[src*="icon"]').first().attr('src') ||
    ''
  );
  const synopsis = clean(($('.entry-content').text() || $('[class*=synop]').text() || ''));
  const statusEl = $('.spe:contains("Status") span, [class*=status]').first();
  const status = clean(statusEl.text() || '');
  const totalEpEl = $('.spe:contains("Episode") span').first();
  const totalEp = clean(totalEpEl.text() || '');
  const genres = [];
  $('a[href*="/genres/"]').each((i, el) => {
    const g = clean($(el).text());
    if (g && g !== 'Genre' && !genres.includes(g)) genres.push(g);
  });
  const episodes = [];
  $('a[href*="-episode-"]').each((i, el) => {
    const href = $(el).attr('href');
    const epTitle = clean($(el).text());
    const epMatch = href.match(/episode-(\d+)/);
    const epNum = epMatch ? parseInt(epMatch[1]) : null;
    const epUrl = href.startsWith('http') ? href : BASE + href;
    if (epTitle && epNum && !episodes.find(e => e.episode === epNum)) {
      episodes.push({ title: epTitle, url: epUrl, episode: epNum });
    }
  });
  episodes.sort((a, b) => a.episode - b.episode);
  return { title, thumbnail: thumb, synopsis, status: status || undefined, total_episode: totalEp || undefined, genres, episodes };
}

function parseEpisode(html) {
  const $ = load(html);
  const title = clean($('title').text().replace(/ - Nonton Anime ID.*/, ''));
  const vidMatch = html.match(/vid=([A-Za-z0-9+/=]{50,})/);
  const vid = vidMatch ? vidMatch[1] : null;
  const embedUrl = vid ? MIRROR + '/video-embed/?vid=' + vid : null;
  const downloads = [];
  $('a[href*="out"], a[href*="drive"], a[href*="google"], a[href*="mega"], a[href*="zippy"], a[href*="mp4upload"]').each((i, el) => {
    downloads.push({ label: clean($(el).text()), url: $(el).attr('href') });
  });
  return { title, vid, embed_url: embedUrl, download_links: downloads };
}

async function search(query, page = 1) {
  const params = new URLSearchParams({ s: query });
  if (page > 1) params.append('page', page);
  const html = await request(BASE + '/?' + params.toString());
  return { results: smartParse(html) };
}

async function ongoingList() {
  const html = await request(BASE + '/ongoing-list/');
  return { results: parseOngoing(html) };
}

async function popularSeries() {
  const html = await request(BASE + '/popular-series/');
  return { results: parsePopular(html) };
}

async function jadwalRilis() {
  const html = await request(BASE + '/jadwal-rilis/');
  return { results: parseJadwal(html) };
}

async function animeDetail(url) {
  const html = await request(url);
  return parseDetail(html);
}

async function episodeDetail(url) {
  const html = await request(url);
  return parseEpisode(html);
}

// BAGIAN PENTING YANG DIUBAH: Export fungsi agar bisa dipakai oleh server API
module.exports = {
  search,
  ongoingList,
  popularSeries,
  jadwalRilis,
  animeDetail,
  episodeDetail
};
