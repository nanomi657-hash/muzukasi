import React, { useState, useEffect } from 'react';
import { 
  Search, Play, Star, ChevronRight, ArrowUp, Heart, 
  Clock, Flame, Calendar, Film, ListFilter, MessageSquare, 
  Share2, Eye, User, Sparkles, CheckCircle2, AlertCircle, ChevronLeft
} from 'lucide-react';

// KONFIGURASI SISTEM UTAMA
const API_BASE = 'http://localhost:5000/api';
const GENRES_LIST = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Magic', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
];

export default function App() {
  // --- STATE MANAGEMENT UTAMA ---
  const [activeTab, setActiveTab] = useState('ongoing');
  const [activeGenre, setActiveGenre] = useState(null);
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // --- HERO CAROUSEL STATE ---
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // --- STATE PERSISTENCE (LOCAL STORAGE) ---
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  
  // --- STATE FILTER & INTERAKSI TAMBAHAN ---
  const [filterType, setFilterType] = useState('all'); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [commentInput, setCommentInput] = useState('');
  const [mockComments, setMockComments] = useState([
    { id: 1, user: 'KuroNeko', text: 'Gokil, grafiknya memanjakan mata banget eps kali ini!', time: '2 jam lalu' },
    { id: 2, user: 'WibuSepuh', text: 'Sesuai ekspektasi dari studionya, pacing cerita rapi.', time: '5 jam lalu' }
  ]);

  // --- EFFECT: HERO AUTO ROTATE / SLIDER ---
  useEffect(() => {
    if (animeList.length > 1 && !selectedAnime && !searchQuery && !activeGenre) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % Math.min(animeList.length, 4));
      }, 5000); // Berganti setiap 5 detik
      return () => clearInterval(interval);
    }
  }, [animeList, selectedAnime, searchQuery, activeGenre]);

  // --- EFFECT: DETEKSI SCROLL ---
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- EFFECT: INITIAL LOAD DARI LOCAL STORAGE ---
  useEffect(() => {
    const savedFavs = localStorage.getItem('mizu_favs');
    const savedHist = localStorage.getItem('mizu_history');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedHist) setHistory(JSON.parse(savedHist));
    
    if (!searchQuery && !activeGenre) {
      fetchList(activeTab);
    }
  }, [activeTab, searchQuery]);

  // --- ENGINE CORE: FETCH DATA ---
  const fetchList = async (type) => {
    setLoading(true);
    setActiveGenre(null);
    try {
      const res = await fetch(`${API_BASE}/${type}`);
      const data = await res.json();
      setAnimeList(data.results || []);
    } catch (err) {
      // Fail-safe mock data jika API lokal mati agar UI tidak kosong melompong
      setAnimeList([
        { title: "Wistoria: Wand and Sword Season 2", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500", url: "wistoria-s2", rating: "8.4", episode: "10", type: "TV" },
        { title: "Mission: Yozakura Family Season 2", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500", url: "yozakura-s2", rating: "7.9", episode: "10", type: "TV" },
        { title: "Digimon Beyond", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500", url: "digimon-b", rating: "8.1", episode: "35", type: "TV" },
        { title: "The Eminence in Shadow Movie", image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=500", url: "eminence-movie", rating: "9.0", episode: "Movie", type: "Movie" }
      ]);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleGenreFilter = async (genreName) => {
    setLoading(true);
    setActiveGenre(genreName);
    setSearchQuery('');
    try {
      const res = await fetch(`${API_BASE}/genre/${genreName.toLowerCase()}`);
      const data = await res.json();
      setAnimeList(data.results || []);
    } catch (err) {
      // Mock Fallback
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSelectedAnime(null);
    setSelectedEpisode(null);
    setActiveGenre(null);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setAnimeList(data.results || []);
    } catch (err) {
      // Filter mock lokal sederhana
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleAnimeClick = async (url) => {
    setLoading(true);
    setSelectedEpisode(null);
    try {
      const res = await fetch(`${API_BASE}/anime?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setSelectedAnime(data);
    } catch (err) {
      // Fallback detail mock object
      setSelectedAnime({
        title: "Wistoria: Wand and Sword Season 2",
        thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500",
        status: "Ongoing",
        type: "TV Series",
        score: "8.4",
        studio: "Actas / Bandai Namco Pictures",
        genres: ["Action", "Fantasy", "Magic"],
        synopsis: "Kelanjutan perjalanan Will Serfort dalam mendaki menara sihir tertinggi menggunakan kemampuan pedang murninya di dunia yang mendewakan mantra sihir magis.",
        episodes: [{ episode: "1", url: "ep1" }, { episode: "2", url: "ep2" }, { episode: "3", url: "ep3" }, { episode: "4", url: "ep4" }, { episode: "5", url: "ep5" }]
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleEpisodeClick = async (epTitle, epUrl) => {
    setLoading(true);
    setSelectedEpisode({ title: epTitle, embed_url: "" });
    setTimeout(() => setLoading(false), 500);
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

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setMockComments([{ id: Date.now(), user: 'Kamu', text: commentInput, time: 'Baru saja' }, ...mockComments]);
    setCommentInput('');
  };

  const filteredAnimeList = animeList.filter(anime => {
    const matchType = filterType === 'all' || (anime.type && anime.type.toLowerCase() === filterType);
    return matchType;
  });

  // Ambil anime untuk banner hero aktif
  const currentHeroAnime = animeList[currentHeroIndex] || animeList[0];

  return (
    <div className="min-h-screen font-sans pb-28 bg-[#0B0C0F] text-[#EFF0F3] selection:bg-white selection:text-black">
      
      {/* HEADER UTAMA MINIMALIS */}
      <header className="sticky top-0 z-50 bg-[#0B0C0F]/90 backdrop-blur-md px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5">
        <div 
          className="cursor-pointer"
          onClick={() => { setSelectedAnime(null); setSelectedEpisode(null); setSearchQuery(''); setActiveGenre(null); }}
        >
          <span className="text-xl font-black tracking-tight text-white">
            Red<span className="text-red-500 font-normal">Core.tv</span>
          </span>
        </div>

        {/* SEARCH BAR BARU */}
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14161D] border border-white/10 text-xs rounded-full pl-10 pr-4 py-2.5 outline-none text-white focus:border-white/30 transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
        </form>
      </header>

      {/* CORE VIEWPORT */}
      <main className="max-w-5xl mx-auto p-4 space-y-8">
        
        {selectedAnime ? (
          /* ========================================================================= */
          /* LAYOUT 1: DETAIL CINEMATIC VIDEO SCREEN                                   */
          /* ========================================================================= */
          <div className="space-y-6 animate-fade-in">
            <button 
              onClick={() => { if(selectedEpisode) { setSelectedEpisode(null); } else { setSelectedAnime(null); } }}
              className="text-xs bg-[#14161D] text-gray-300 font-bold px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 hover:bg-[#1C1F29]"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>

            {selectedEpisode && (
              <div className="space-y-4">
                <div className="w-full aspect-video rounded-2xl bg-black border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">External stream player wrapper node is loaded active.</p>
                  </div>
                </div>
                <h2 className="text-base font-bold">{selectedEpisode.title}</h2>
              </div>
            )}

            {/* DETAIL MATRIKS CARDS */}
            <div className="flex flex-col md:flex-row gap-6 bg-[#14161D] p-6 rounded-3xl border border-white/5">
              <img src={selectedAnime.thumbnail} className="w-40 h-56 object-cover rounded-xl shadow-lg mx-auto md:mx-0" alt="" />
              <div className="space-y-4 flex-1">
                <h1 className="text-2xl font-black tracking-tight text-white">{selectedAnime.title}</h1>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-gray-400">
                  <span className="bg-black/40 px-2.5 py-1 rounded">Score: ★ {selectedAnime.score}</span>
                  <span className="bg-black/40 px-2.5 py-1 rounded">{selectedAnime.status}</span>
                  <span className="bg-black/40 px-2.5 py-1 rounded">{selectedAnime.type}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-light">{selectedAnime.synopsis}</p>

                {/* EPISODE NAVIGATION */}
                <div className="pt-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Available Episodes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnime.episodes?.map((ep) => (
                      <button 
                        key={ep.episode} 
                        onClick={() => handleEpisodeClick(`Episode ${ep.episode}`, ep.url)}
                        className="bg-black/40 border border-white/5 hover:bg-white hover:text-black text-xs font-bold px-3 py-2 rounded-lg transition-all"
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
          /* ========================================================================= */
          /* LAYOUT 2: HOME VIEW DENGAN INTERACTIVE AUTOMATIC BANNER CAROUSEL          */
          /* ========================================================================= */
          <div className="space-y-8">
            
            {/* HERO CAROUSEL INTERAKTIF (Bisa Berganti Spontan / Diklik Manual) */}
            {!searchQuery && !activeGenre && currentHeroAnime && (
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] sm:aspect-[16/7] bg-[#14161D] border border-white/5 group shadow-2xl transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0F] via-[#0B0C0F]/40 to-transparent z-10" />
                <img 
                  src={currentHeroAnime.image} 
                  alt="Spotlight" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 transform scale-100 group-hover:scale-105 transition-transform duration-[4000ms] object-center"
                />
                
                {/* CONTENT HERO */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 space-y-3 max-w-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white w-fit px-2.5 py-1 rounded-full border border-white/10">
                    <Flame className="w-3 h-3 fill-white" /> Trending Now
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
                    The hottest releases this week.
                  </h1>
                  <p className="text-xs text-gray-400 font-light max-w-md line-clamp-2">
                    Catch the most-watched anime episodes loved by fans worldwide including {currentHeroAnime.title}.
                  </p>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleAnimeClick(currentHeroAnime.url)}
                      className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-black px-6 py-3 rounded-full transition-transform active:scale-95 shadow-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" /> Watch Now
                    </button>
                    <button 
                      onClick={() => {
                        const nextIdx = (currentHeroIndex + 1) % Math.min(animeList.length, 4);
                        setCurrentHeroIndex(nextIdx);
                      }}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold px-5 py-3 rounded-full transition-all"
                    >
                      Browse Next
                    </button>
                  </div>
                </div>

                {/* INDEX DOTS CAROUSEL (Kanan Bawah Seperti Gambar) */}
                <div className="absolute bottom-6 right-8 z-20 flex gap-1.5">
                  {[0, 1, 2, 3].map((dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => setCurrentHeroIndex(dotIndex % animeList.length)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        currentHeroIndex === dotIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SEPARATOR TITLE & SUBHEADER */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-widest font-mono">
                <Clock className="w-3.5 h-3.5" /> Latest Episodes
              </div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold tracking-tight text-white">Ongoing Anime</h2>
                <span className="text-xs font-medium text-gray-500 cursor-pointer hover:text-white flex items-center gap-1">
                  See all <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* GRID DISPLAY UTAMA - MINIMALIS CLEAN */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {filteredAnimeList.map((anime, index) => (
                <div 
                  key={index}
                  onClick={() => handleAnimeClick(anime.url)}
                  className="group cursor-pointer space-y-2 relative"
                >
                  <div className="relative aspect-[3/4] bg-[#14161D] rounded-2xl overflow-hidden border border-white/5">
                    <img 
                      src={anime.image} 
                      alt={anime.title} 
                      className="object-cover w-full h-full transform group-hover:scale-102 transition-transform duration-500"
                      loading="lazy" 
                    />
                    
                    {/* BUBBLE EPISODE NUMBER (Kiri Atas Seperti Gambar) */}
                    {anime.episode && (
                      <span className="absolute top-3 left-3 bg-[#0B0C0F]/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/5">
                        {anime.episode}
                      </span>
                    )}

                    {/* LOVE ICON PLACEMENT RIGHT TOP AT IMAGES */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(anime); }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0B0C0F]/80 backdrop-blur-md text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart 
                        className="w-3.5 h-3.5" 
                        fill={favorites.find(f => f.url === anime.url) ? "#EF4444" : "none"} 
                        stroke={favorites.find(f => f.url === anime.url) ? "#EF4444" : "currentColor"}
                      />
                    </button>
                  </div>

                  {/* METADATA CAPTION */}
                  <div className="px-1">
                    <h3 className="text-xs font-bold text-gray-300 line-clamp-1 group-hover:text-white transition-colors">
                      {anime.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                      {anime.type || 'TV Series'} • S2
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* APP STYLISH BOTTOM NAVIGATION BAR (MIRIP PERSIS GAMBAR)                   */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#14161D]/90 backdrop-blur-xl border-t border-white/5 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          
          <button 
            onClick={() => { setSelectedAnime(null); setSelectedEpisode(null); setActiveTab('ongoing'); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'ongoing' && !selectedAnime ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className={`p-2 rounded-full ${activeTab === 'ongoing' && !selectedAnime ? 'bg-blue-500/10' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <span>Home</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-gray-500">
            <div className="p-2">
              <Search className="w-5 h-5" />
            </div>
            <span>Search</span>
          </button>

          <button 
            onClick={() => { setActiveTab('history'); setSelectedAnime(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}
          >
            <div className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </div>
            <span>Library</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-gray-500">
            <div className="p-2">
              <Calendar className="w-5 h-5" />
            </div>
            <span>Schedule</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-gray-500">
            <div className="p-2">
              <ListFilter className="w-5 h-5" />
            </div>
            <span>Genres</span>
          </button>

          {/* FLOATING ACTION FLOATING LOVE BUBBLE ICON */}
          <div 
            onClick={() => { setActiveTab('favorite'); setSelectedAnime(null); setAnimeList(favorites); }}
            className="absolute -top-7 right-4 bg-[#14161D] border border-white/10 p-3 rounded-full cursor-pointer shadow-xl group hover:scale-105 transition-transform"
          >
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          </div>

        </div>
      </div>

    </div>
  );
}
