"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Film,
  Music,
  Search,
  ChevronRight,
  ChevronDown,
  Hash,
  Mic,
  Disc3,
  X,
} from "lucide-react";
import songsData from "../../data/songsData";

const ALPHABET = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function MoviesPage() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState(null);
  const [expandedMovie, setExpandedMovie] = useState(null);

  // Build movie → songs map
  const movieMap = useMemo(() => {
    const map = {};
    songsData.forEach((song, index) => {
      const movie = song.movie?.trim() || "Unknown";
      if (movie === "Unknown") return;
      if (!map[movie]) {
        map[movie] = {
          name: movie,
          songs: [],
          music: song.music || "Unknown",
        };
      }
      map[movie].songs.push({ ...song, originalIndex: index });
    });
    return map;
  }, []);

  // Sort and group by first letter
  const groupedMovies = useMemo(() => {
    let movies = Object.values(movieMap);

    if (search) {
      const q = search.toLowerCase();
      movies = movies.filter((m) => m.name.toLowerCase().includes(q));
    }

    if (activeLetter) {
      movies = movies.filter((m) => {
        const first = m.name.charAt(0).toUpperCase();
        if (activeLetter === "#") return !/[A-Z]/i.test(first);
        return first === activeLetter;
      });
    }

    movies.sort((a, b) => a.name.localeCompare(b.name));

    const groups = {};
    movies.forEach((m) => {
      const first = m.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : "#";
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(m);
    });

    return groups;
  }, [movieMap, search, activeLetter]);

  const totalMovies = Object.keys(movieMap).length;
  const totalFiltered = Object.values(groupedMovies).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const toggleMovie = (name) => {
    setExpandedMovie(expandedMovie === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-violet-50/80 via-white to-white pt-12 pb-10 md:pt-16 md:pb-14 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="fade-in">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-semibold mb-6">
              <Film size={12} strokeWidth={2.5} />
              {totalMovies.toLocaleString()} Movies
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 leading-[1.1] tracking-tight fade-in stagger-1">
            Movies{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              A–Z
            </span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto fade-in stagger-2">
            Browse all Tamil movie soundtracks — tap a movie to see its songs
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto fade-in stagger-3">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={18} strokeWidth={2} className="text-slate-300" />
            </div>
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              className="w-full pl-13 pr-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-medium outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100 shadow-sm hover:shadow-md transition-all duration-300"
              onChange={(e) => {
                setSearch(e.target.value);
                setExpandedMovie(null);
              }}
              id="movies-search"
            />
          </div>
        </div>
      </section>

      {/* Alphabet Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-wrap justify-center gap-1.5 mb-6 fade-in stagger-4">
          <button
            onClick={() => {
              setActiveLetter(null);
              setExpandedMovie(null);
            }}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeLetter === null
                ? "bg-violet-500 text-white shadow-md shadow-violet-500/25"
                : "bg-slate-50 text-slate-400 hover:bg-violet-50 hover:text-violet-500 border border-slate-100"
            }`}
          >
            All
          </button>
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => {
                setActiveLetter(activeLetter === letter ? null : letter);
                setExpandedMovie(null);
              }}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeLetter === letter
                  ? "bg-violet-500 text-white shadow-md shadow-violet-500/25"
                  : "bg-slate-50 text-slate-400 hover:bg-violet-50 hover:text-violet-500 border border-slate-100"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 font-medium mb-6">
          {totalFiltered.toLocaleString()} movies found
        </p>
      </section>

      {/* Movies List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {Object.keys(groupedMovies).length === 0 ? (
          <div className="text-center py-24 fade-in">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              No Movies Found
            </h3>
            <p className="text-slate-400 font-medium">
              Try a different search or letter
            </p>
          </div>
        ) : (
          Object.keys(groupedMovies)
            .sort()
            .map((letter) => (
              <div key={letter} className="mb-8" id={`letter-${letter}`}>
                {/* Letter Header */}
                <div className="flex items-center gap-3 mb-4 sticky top-16 z-10 bg-white/90 backdrop-blur-sm py-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                    {letter === "#" ? (
                      <Hash size={18} strokeWidth={2.5} className="text-violet-500" />
                    ) : (
                      <span className="text-lg font-black text-violet-500">{letter}</span>
                    )}
                  </div>
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold text-slate-400">
                    {groupedMovies[letter].length} movies
                  </span>
                </div>

                {/* Movie Cards */}
                <div className="space-y-2">
                  {groupedMovies[letter].map((movie) => {
                    const isExpanded = expandedMovie === movie.name;
                    return (
                      <div key={movie.name} className="cinema-card overflow-hidden">
                        {/* Movie Row (clickable) */}
                        <button
                          onClick={() => toggleMovie(movie.name)}
                          className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                            <Film size={16} strokeWidth={2} className="text-violet-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-slate-700 truncate">
                              {movie.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Music size={10} strokeWidth={2.5} />
                              {movie.songs.length} song{movie.songs.length !== 1 ? "s" : ""}
                              {movie.music && movie.music !== "Unknown" && (
                                <span className="text-slate-300"> · 🎵 {movie.music}</span>
                              )}
                            </p>
                          </div>
                          <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                            <ChevronDown size={16} className="text-slate-300" />
                          </div>
                        </button>

                        {/* Expanded Songs List */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 space-y-1 fade-in">
                            <div className="flex items-center justify-between mb-2 px-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                                {movie.songs.length} Songs from {movie.name}
                              </span>
                              <button
                                onClick={() => setExpandedMovie(null)}
                                className="text-slate-300 hover:text-slate-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            {movie.songs.map((song, i) => (
                              <Link
                                key={song.originalIndex}
                                href={`/song/${song.originalIndex}`}
                              >
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer group">
                                  <span className="w-6 h-6 shrink-0 rounded-lg bg-violet-50 flex items-center justify-center text-[10px] font-bold text-violet-400">
                                    {i + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-slate-700 truncate group-hover:text-violet-600 transition-colors">
                                      {song.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                                      {song.singers && song.singers !== "Unknown" && (
                                        <span className="flex items-center gap-0.5">
                                          <Mic size={9} /> {song.singers.split(/[,&]|\band\b/i)[0].trim()}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-300 group-hover:text-violet-400 shrink-0" />
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
