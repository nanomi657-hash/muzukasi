import React, { useState, useEffect } from 'react';
import { 
  Search, Play, Heart, Clock, Sparkles, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

// KONFIGURASI SISTEM UTAMA (TERHUBUNG KE BACKEND SCRAPER)
const API_BASE = 'http://localhost:5000/api';

export default function App() {
  // --- STATE MANAGEMENT UTAMA ---
  const [activeTab, setActiveTab] = useState('ongoing');
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  
  // --- HERO CAROUSEL STATE ---
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // --- STATE PERSISTENCE (LOCAL STORAGE) ---
  const [favorites, setFavorites] = useState([]);

  // --- EFFECT: HERO AUTO ROTATE ---
  useEffect(() => {
    if (animeList.length > 1 && !selectedAnime && !searchQuery) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % Math.min(animeList.length, 4));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [animeList, selectedAnime, searchQuery]);

  // --- EFFECT UTAMA: JALAN OTOMATIS SAAT DI BUKA DI CHROME ---
  useEffect(() => {
    const savedFavs = localStorage.getItem('mizu_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    // Otomatis panggil scraper saat pertama kali aplikasi di-render
    fetchList('ongoing');
  }, []);

  // --- ENGINE CORE: FETCH DATA SCRAPER ---
  const fetchList = async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${type}`);
      const data = await res.json();
      setAnimeList(data.results || data || []);
    } catch (err) {
      console.error("Gagal terhubung ke scraper backend:", err);
      // Fallback data jika backend local terputus
      setAnimeList([
        { title: "Wistoria: Wand and Sword Season 2", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500", url: "wistoria-s2", episode: "10", type: "TV" },
        { title: "Mission: Yozakura Family Season 2", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500", url: "yozakura-s2", episode: "10", type: "TV" },
        { title: "Digimon Beyond", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500", url: "digimon-b", episode: "35", type: "TV" },
        { title: "The Eminence in Shadow Movie", image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=500", url: "eminence-movie", episode: "Movie", type: "Movie" }
      ]);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSelectedAnime(null);
    setSelectedEpisode(null);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setAnimeList(data.results || data || []);
    } catch (err) {
      console.error("Gagal mencari anime:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = async (url) => {
    setLoading(true);
    setSelectedEpisode(null);
    try {
      const res = await fetch(`${API_BASE}/anime?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setSelectedAnime(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Gagal memuat detail anime:", err);
      setSelectedAnime({
        title: "Detail Anime Terpilih",
        thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500",
        status: "Ongoing",
        type: "TV Series",
        score: "8.4",
        synopsis: "Gagal memuat data dari scraper. Periksa kestabilan server lokal Anda.",
        episodes: [{ episode: "1", url: "ep1" }, { episode: "2", url: "ep2" }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeClick = async (epTitle, epUrl) => {
    setSelectedEpisode({ title: epTitle, embed_url: epUrl });
  };

  const toggleFavorite = (animeItem, e) => {
    if (e) e.stopPropagation();
    let updated = [...favorites];
    const isExist = favorites.find(f => f.url === animeItem.url);
    if (isExist) {
      updated = updated.filter(f => f.url !== animeItem.url);
    } else {
      updated.push(animeItem);
    }
    setFavorites(updated);
    localStorage.setItem('mizu_favs', JSON.stringify(updated));
  };

  const resetToHome = () => {
    setSelectedAnime(null);
    setSelectedEpisode(null);
    setSearchQuery('');
    setActiveTab('ongoing');
    fetchList('ongoing');
  };

  const currentHeroAnime = animeList[currentHeroIndex] || animeList[0];

  return (
    <div className="min-h-screen font-sans pb-28 bg-[#09070F] text-[#F3F2F5] selection:bg-[#7C3AED] selection:text-white">
      
      {/* HEADER UTAMA GRADASI VIOLET, HITAM, PUTIH */}
      <header className="sticky top-0 z-50 bg-[#09070F]/90 backdrop-blur-md px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5">
        <div 
          className="cursor-pointer mx-auto sm:mx-0"
          onClick={resetToHome}
        >
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-[#C39FFF] to-[#7C3AED] bg-clip-text text-transparent">
            Mizu<span>Anime</span>
          </span>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#130F22] border border-white/10 text-xs rounded-full pl-10 pr-4 py-2.5 outline-none text-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-purple-400/50" />
        </form>
      </header>

      {/* CORE VIEWPORT */}
      <main className="max-w-5xl mx-auto p-4 space-y-8">
        
        {selectedAnime ? (
          /* LAYOUT 1: DETAIL SCREEN */
          <div className="space-y-6 animate-fade-in">
            <button 
              onClick={() => { if(selectedEpisode) { setSelectedEpisode(null); } else { setSelectedAnime(null); } }}
              className="text-xs bg-[#130F22] text-gray-300 font-bold px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 hover:bg-[#1E1736] hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-[#C39FFF]" /> Back
            </button>

            {selectedEpisode && (
              <div className="space-y-4">
                <div className="w-full aspect-video rounded-2xl bg-black border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-[#7C3AED] mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-purple-300/70">Streaming Player Wrapper Active Node</p>
                  </div>
                </div>
                <h2 className="text-base font-bold text-white">{selectedEpisode.title}</h2>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 bg-[#130F22] p-6 rounded-3xl border border-[#7C3AED]/20 shadow-xl">
              <img src={selectedAnime.thumbnail || selectedAnime.image} className="w-40 h-56 object-cover rounded-xl shadow-md border border-white/10 mx-auto md:mx-0" alt="" />
              <div className="space-y-4 flex-1">
                <h1 className="text-2xl font-black tracking-tight text-white">{selectedAnime.title}</h1>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="bg-[#7C3AED]/20 text-purple-300 px-2.5 py-1 rounded-md border border-[#7C3AED]/30">Score: ★ {selectedAnime.score || 'N/A'}</span>
                  <span className="bg-white/10 text-white px-2.5 py-1 rounded-md">{selectedAnime.status || 'Ongoing'}</span>
                  <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-md">{selectedAnime.type || 'TV'}</span>
                </div>
                <p className="text-xs text-purple-200/70 leading-relaxed font-light">{selectedAnime.synopsis}</p>

                <div className="pt-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-purple-300/80">Available Episodes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnime.episodes?.map((ep, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleEpisodeClick(`Episode ${ep.episode}`, ep.url)}
                        className="bg-black/40 border border-white/5 hover:border-[#7C3AED] hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#A78BFA] hover:text-white text-xs font-bold px-3 py-2 rounded-lg transition-all"
                      >
                        Eps {ep.episode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LAYOUT 2: HOME VIEW */
          <div className="space-y-8">
            
            {/* HERO CAROUSEL */}
            {!searchQuery && currentHeroAnime && (
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] sm:aspect-[16/7] bg-[#130F22] border border-white/5 group shadow-2xl transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-t from-[#09070F] via-[#09070F]/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#09070F]/90 via-transparent to-transparent z-10" />
                <img 
                  src={currentHeroAnime.image} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-35 transform scale-100 group-hover:scale-105 transition-transform duration-[4000ms]"
                />
                
                <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 space-y-3 max-w-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white w-fit px-2.5 py-1 rounded-full border border-white/10">
                    <Sparkles className="w-3 h-3 fill-white" /> Trending Spotlight
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white line-clamp-1">
                    {currentHeroAnime.title}
                  </h1>
                  <p className="text-xs text-purple-200/60 font-light max-w-md">
                    Click watch now to stream the latest release right away from scraper channel nodes.
                  </p>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleAnimeClick(currentHeroAnime.url)}
                      className="flex items-center gap-2 bg-gradient-to-r from-white via-purple-100 to-white text-black text-xs font-black px-6 py-3 rounded-full shadow-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" /> Watch Now
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-6 right-8 z-20 flex gap-1.5">
                  {[0, 1, 2, 3].map((dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => setCurrentHeroIndex(dotIndex % Math.max(animeList.length, 1))}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentHeroIndex === dotIndex ? 'w-6 bg-[#C39FFF]' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SEPARATOR TITLE */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-purple-400 uppercase tracking-widest font-mono">
                <Clock className="w-3.5 h-3.5 text-[#7C3AED]" /> Latest Episodes
              </div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  {searchQuery ? 'Search Results' : activeTab === 'favorite' ? 'My Library' : 'Ongoing Anime'}
                </h2>
              </div>
            </div>

            {/* LIVE GRID BANNER ANIME */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="space-y-3 animate-pulse">
                    <div className="relative aspect-[3/4] bg-[#130F22] rounded-2xl border border-white/5" />
                    <div className="h-3 bg-[#130F22] rounded-md w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {animeList.map((anime, index) => (
                  <div 
                    key={index}
                    onClick={() => handleAnimeClick(anime.url)}
                    className="group cursor-pointer space-y-2 relative"
                  >
                    <div className="relative aspect-[3/4] bg-[#130F22] rounded-2xl overflow-hidden border border-white/5 shadow-md group-hover:border-[#7C3AED]/40 transition-all duration-300">
                      <img 
                        src={anime.image} 
                        alt={anime.title} 
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy" 
                      />
                      
                      {anime.episode && (
                        <span className="absolute top-3 left-3 bg-[#09070F]/80 backdrop-blur-md text-purple-200 text-[10px] font-black px-2 py-0.5 rounded-lg border border-[#7C3AED]/30">
                          {anime.episode}
                        </span>
                      )}

                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(anime); }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-[#09070F]/80 backdrop-blur-md text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Heart 
                          className="w-3.5 h-3.5" 
                          fill={favorites.find(f => f.url === anime.url) ? "#A78BFA" : "none"} 
                          stroke={favorites.find(f => f.url === anime.url) ? "#A78BFA" : "currentColor"}
                        />
                      </button>
                    </div>

                    <div className="px-1">
                      <h3 className="text-xs font-bold text-gray-200 line-clamp-1 group-hover:text-[#C39FFF] transition-colors">
                        {anime.title}
                      </h3>
                      <p className="text-[10px] text-purple-400/70 font-medium uppercase tracking-wider">
                        {anime.type || 'TV Series'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* APP MINIMALIST BOTTOM NAVIGATION BAR (ONLY ICON HOME & FLOATING FAVORITE) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#130F22]/90 backdrop-blur-xl border-t border-white/5 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          
          {/* LOGO / TOMBOL HOME ICON DI SEBELAH KIRI */}
          <button 
            onClick={resetToHome}
            className="flex items-center justify-center text-white bg-[#7C3AED]/10 border border-[#7C3AED]/30 p-3 rounded-full shadow-lg hover:bg-[#7C3AED]/20 active:scale-95 transition-all"
            title="Home"
          >
            <svg className="w-5 h-5 text-[#C39FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {/* FLOATING ACTION VIOLET BUBBLE LOVE DI SEBELAH KANAN */}
          <button 
            onClick={() => { setActiveTab('favorite'); setSelectedAnime(null); setAnimeList(favorites); }}
            className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] border border-white/20 p-3.5 rounded-full cursor-pointer shadow-xl shadow-purple-500/30 active:scale-90 transition-transform"
            title="Favorites"
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </button>

        </div>
      </div>

    </div>
  );
}
