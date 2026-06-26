"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Mic,
  Music,
  Search,
  ChevronRight,
  ChevronDown,
  Hash,
  Film,
  X,
} from "lucide-react";
import songsData from "../../data/songsData";

const ALPHABET = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function SingersPage() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState(null);
  const [expandedSinger, setExpandedSinger] = useState(null);

  // Build singer → songs map
  const singerMap = useMemo(() => {
    const map = {};
    songsData.forEach((song, index) => {
      if (!song.singers || song.singers === "Unknown") return;
      // Split by comma, ampersand, or the word 'and'
      const singers = song.singers.split(/[,&]|\band\b/i).map((s) => s.trim()).filter(Boolean);
      singers.forEach((singer) => {
        // Clean up any stray "Music by :" or other metadata that slipped through
        let cleanName = singer.replace(/^(Music by\s*:|Singer\s*:|Lyrics\s*:)\s*/i, '').trim();
        if (!cleanName || cleanName === "Unknown") return;
        
        if (!map[cleanName]) {
          map[cleanName] = { name: cleanName, songs: [] };
        }
        map[cleanName].songs.push({ ...song, originalIndex: index });
      });
    });
    return map;
  }, []);

  // Sort and group
  const groupedSingers = useMemo(() => {
    let singers = Object.values(singerMap);

    if (search) {
      const q = search.toLowerCase();
      singers = singers.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (activeLetter) {
      singers = singers.filter((s) => {
        const first = s.name.charAt(0).toUpperCase();
        if (activeLetter === "#") return !/[A-Z]/i.test(first);
        return first === activeLetter;
      });
    }

    singers.sort((a, b) => a.name.localeCompare(b.name));

    const groups = {};
    singers.forEach((s) => {
      const first = s.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : "#";
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(s);
    });

    return groups;
  }, [singerMap, search, activeLetter]);

  const totalSingers = Object.keys(singerMap).length;
  const totalFiltered = Object.values(groupedSingers).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // Top 12 singers
  const topSingers = useMemo(() => {
    return Object.values(singerMap)
      .sort((a, b) => b.songs.length - a.songs.length)
      .slice(0, 12);
  }, [singerMap]);

  const toggleSinger = (name) => {
    setExpandedSinger(expandedSinger === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-sky-50/80 via-white to-white pt-12 pb-10 md:pt-16 md:pb-14 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="fade-in">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold mb-6">
              <Mic size={12} strokeWidth={2.5} />
              {totalSingers.toLocaleString()} Singers
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 leading-[1.1] tracking-tight fade-in stagger-1">
            Browse{" "}
            <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
              Singers
            </span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto fade-in stagger-2">
            Tap a singer to explore their songs — then pick one to read the lyrics
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto fade-in stagger-3">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={18} strokeWidth={2} className="text-slate-300" />
            </div>
            <input
              type="text"
              placeholder="Search singers..."
              value={search}
              className="w-full pl-13 pr-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-medium outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 shadow-sm hover:shadow-md transition-all duration-300"
              onChange={(e) => {
                setSearch(e.target.value);
                setExpandedSinger(null);
              }}
              id="singers-search"
            />
          </div>
        </div>
      </section>

      {/* Top Singers */}
      {!search && !activeLetter && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              🔥 Top Singers
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topSingers.map((singer) => (
              <button
                key={singer.name}
                onClick={() => {
                  setExpandedSinger(singer.name);
                  // scroll to the singer in the list
                  setTimeout(() => {
                    const el = document.getElementById(`singer-${singer.name.replace(/[^a-zA-Z0-9]/g, "-")}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
                className="text-left"
              >
                <div className="cinema-card p-4 text-center cursor-pointer h-full flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-cyan-50 border border-sky-100 flex items-center justify-center">
                    <Mic size={18} strokeWidth={2} className="text-sky-500" />
                  </div>
                  <h3 className="font-semibold text-xs text-slate-700 line-clamp-2 leading-tight">
                    {singer.name}
                  </h3>
                  <span className="text-[10px] font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">
                    {singer.songs.length} songs
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Alphabet Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-wrap justify-center gap-1.5 mb-6">
          <button
            onClick={() => {
              setActiveLetter(null);
              setExpandedSinger(null);
            }}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeLetter === null
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-500 border border-slate-100"
            }`}
          >
            All
          </button>
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => {
                setActiveLetter(activeLetter === letter ? null : letter);
                setExpandedSinger(null);
              }}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeLetter === letter
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-500 border border-slate-100"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 font-medium mb-6">
          {totalFiltered.toLocaleString()} singers found
        </p>
      </section>

      {/* Singers List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {Object.keys(groupedSingers).length === 0 ? (
          <div className="text-center py-24 fade-in">
            <div className="text-6xl mb-4">🎤</div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              No Singers Found
            </h3>
            <p className="text-slate-400 font-medium">
              Try a different search or letter
            </p>
          </div>
        ) : (
          Object.keys(groupedSingers)
            .sort()
            .map((letter) => (
              <div key={letter} className="mb-8" id={`letter-${letter}`}>
                {/* Letter Header */}
                <div className="flex items-center gap-3 mb-4 sticky top-16 z-10 bg-white/90 backdrop-blur-sm py-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                    {letter === "#" ? (
                      <Hash size={18} strokeWidth={2.5} className="text-sky-500" />
                    ) : (
                      <span className="text-lg font-black text-sky-500">{letter}</span>
                    )}
                  </div>
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold text-slate-400">
                    {groupedSingers[letter].length} singers
                  </span>
                </div>

                {/* Singer Cards */}
                <div className="space-y-2">
                  {groupedSingers[letter].map((singer) => {
                    const isExpanded = expandedSinger === singer.name;
                    return (
                      <div
                        key={singer.name}
                        className="cinema-card overflow-hidden"
                        id={`singer-${singer.name.replace(/[^a-zA-Z0-9]/g, "-")}`}
                      >
                        {/* Singer Row */}
                        <button
                          onClick={() => toggleSinger(singer.name)}
                          className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                            <Mic size={16} strokeWidth={2} className="text-sky-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-slate-700 truncate">
                              {singer.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Music size={10} strokeWidth={2.5} />
                              {singer.songs.length} song{singer.songs.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                            <ChevronDown size={16} className="text-slate-300" />
                          </div>
                        </button>

                        {/* Expanded Songs */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 space-y-1 fade-in">
                            <div className="flex items-center justify-between mb-2 px-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500">
                                {singer.songs.length} Songs by {singer.name}
                              </span>
                              <button
                                onClick={() => setExpandedSinger(null)}
                                className="text-slate-300 hover:text-slate-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            {singer.songs.map((song, i) => (
                              <Link
                                key={song.originalIndex}
                                href={`/song/${song.originalIndex}`}
                              >
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-sky-200 hover:shadow-sm transition-all cursor-pointer group">
                                  <span className="w-6 h-6 shrink-0 rounded-lg bg-sky-50 flex items-center justify-center text-[10px] font-bold text-sky-400">
                                    {i + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-slate-700 truncate group-hover:text-sky-600 transition-colors">
                                      {song.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                                      <span className="flex items-center gap-0.5">
                                        <Film size={9} /> {song.movie}
                                      </span>
                                    </p>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-400 shrink-0" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </section>
    </div>
  );
}
