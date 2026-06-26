"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PenTool,
  Music,
  Search,
  ChevronRight,
  ChevronDown,
  Hash,
  Film,
  Mic,
  X,
} from "lucide-react";
import songsData from "../../data/songsData";

const ALPHABET = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function LyricistsPage() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState(null);
  const [expandedLyricist, setExpandedLyricist] = useState(null);

  // Build lyricist → songs map
  const lyricistMap = useMemo(() => {
    const map = {};
    songsData.forEach((song, index) => {
      if (!song.lyricist || song.lyricist === "Unknown" || song.lyricist === "N/A") return;
      
      const lyricists = song.lyricist.split(/[,&]|\band\b/i).map((l) => l.trim()).filter(Boolean);
      lyricists.forEach((lyricist) => {
        let cleanName = lyricist.replace(/^(Lyrics by\s*:|Lyricist\s*:)\s*/i, '').trim();
        if (!cleanName || cleanName === "Unknown" || cleanName === "N/A") return;
        
        if (!map[cleanName]) {
          map[cleanName] = { name: cleanName, songs: [] };
        }
        map[cleanName].songs.push({ ...song, originalIndex: index });
      });
    });
    return map;
  }, []);

  // Sort and group
  const groupedLyricists = useMemo(() => {
    let lyricists = Object.values(lyricistMap);

    if (search) {
      const q = search.toLowerCase();
      lyricists = lyricists.filter((l) => l.name.toLowerCase().includes(q));
    }

    if (activeLetter) {
      lyricists = lyricists.filter((l) => {
        const first = l.name.charAt(0).toUpperCase();
        if (activeLetter === "#") return !/[A-Z]/i.test(first);
        return first === activeLetter;
      });
    }

    lyricists.sort((a, b) => a.name.localeCompare(b.name));

    const groups = {};
    lyricists.forEach((l) => {
      const first = l.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : "#";
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(l);
    });

    return groups;
  }, [lyricistMap, search, activeLetter]);

  const totalLyricists = Object.keys(lyricistMap).length;
  const totalFiltered = Object.values(groupedLyricists).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // Top 12 lyricists
  const topLyricists = useMemo(() => {
    return Object.values(lyricistMap)
      .sort((a, b) => b.songs.length - a.songs.length)
      .slice(0, 12);
  }, [lyricistMap]);

  const toggleLyricist = (name) => {
    setExpandedLyricist(expandedLyricist === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-amber-50/80 via-white to-white pt-12 pb-10 md:pt-16 md:pb-14 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="fade-in">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold mb-6">
              <PenTool size={12} strokeWidth={2.5} />
              {totalLyricists.toLocaleString()} Lyricists
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 leading-[1.1] tracking-tight fade-in stagger-1">
            Browse{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Lyricists
            </span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto fade-in stagger-2">
            Tap a lyricist to explore their compositions — then pick a song to read
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto fade-in stagger-3">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={18} strokeWidth={2} className="text-slate-300" />
            </div>
            <input
              type="text"
              placeholder="Search lyricists..."
              value={search}
              className="w-full pl-13 pr-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-medium outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100 shadow-sm hover:shadow-md transition-all duration-300"
              onChange={(e) => {
                setSearch(e.target.value);
                setExpandedLyricist(null);
              }}
              id="lyricists-search"
            />
          </div>
        </div>
      </section>

      {/* Top Lyricists */}
      {!search && !activeLetter && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              ✍️ Top Lyricists
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topLyricists.map((lyricist) => (
              <button
                key={lyricist.name}
                onClick={() => {
                  setExpandedLyricist(lyricist.name);
                  setTimeout(() => {
                    const el = document.getElementById(`lyricist-${lyricist.name.replace(/[^a-zA-Z0-9]/g, "-")}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
                className="text-left"
              >
                <div className="cinema-card p-4 text-center cursor-pointer h-full flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-50 border border-amber-100 flex items-center justify-center">
                    <PenTool size={18} strokeWidth={2} className="text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-xs text-slate-700 line-clamp-2 leading-tight">
                    {lyricist.name}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                    {lyricist.songs.length} songs
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
              setExpandedLyricist(null);
            }}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeLetter === null
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                : "bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500 border border-slate-100"
            }`}
          >
            All
          </button>
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => {
                setActiveLetter(activeLetter === letter ? null : letter);
                setExpandedLyricist(null);
              }}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeLetter === letter
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                  : "bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500 border border-slate-100"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 font-medium mb-6">
          {totalFiltered.toLocaleString()} lyricists found
        </p>
      </section>

      {/* Lyricists List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {Object.keys(groupedLyricists).length === 0 ? (
          <div className="text-center py-24 fade-in">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              No Lyricists Found
            </h3>
            <p className="text-slate-400 font-medium">
              Try a different search or letter
            </p>
          </div>
        ) : (
          Object.keys(groupedLyricists)
            .sort()
            .map((letter) => (
              <div key={letter} className="mb-8" id={`letter-${letter}`}>
                {/* Letter Header */}
                <div className="flex items-center gap-3 mb-4 sticky top-16 z-10 bg-white/90 backdrop-blur-sm py-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    {letter === "#" ? (
                      <Hash size={18} strokeWidth={2.5} className="text-amber-500" />
                    ) : (
                      <span className="text-lg font-black text-amber-500">{letter}</span>
                    )}
                  </div>
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold text-slate-400">
                    {groupedLyricists[letter].length} lyricists
                  </span>
                </div>

                {/* Lyricist Cards */}
                <div className="space-y-2">
                  {groupedLyricists[letter].map((lyricist) => {
                    const isExpanded = expandedLyricist === lyricist.name;
                    return (
                      <div
                        key={lyricist.name}
                        className="cinema-card overflow-hidden"
                        id={`lyricist-${lyricist.name.replace(/[^a-zA-Z0-9]/g, "-")}`}
                      >
                        {/* Lyricist Row */}
                        <button
                          onClick={() => toggleLyricist(lyricist.name)}
                          className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                            <PenTool size={16} strokeWidth={2} className="text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-slate-700 truncate">
                              {lyricist.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Music size={10} strokeWidth={2.5} />
                              {lyricist.songs.length} song{lyricist.songs.length !== 1 ? "s" : ""}
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
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                {lyricist.songs.length} Songs by {lyricist.name}
                              </span>
                              <button
                                onClick={() => setExpandedLyricist(null)}
                                className="text-slate-300 hover:text-slate-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            {lyricist.songs.map((song, i) => (
                              <Link
                                key={song.originalIndex}
                                href={`/song/${song.originalIndex}`}
                              >
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer group">
                                  <span className="w-6 h-6 shrink-0 rounded-lg bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-400">
                                    {i + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-slate-700 truncate group-hover:text-amber-600 transition-colors">
                                      {song.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                                      <span className="flex items-center gap-0.5">
                                        <Film size={9} /> {song.movie}
                                      </span>
                                      {song.singers && song.singers !== "Unknown" && (
                                        <span className="flex items-center gap-0.5">
                                          <Mic size={9} /> {song.singers.split(/[,&]|\band\b/i)[0].trim()}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-400 shrink-0" />
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
