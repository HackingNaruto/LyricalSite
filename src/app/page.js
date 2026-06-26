"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Music,
  ChevronDown,
  Film,
  Mic,
  Disc3,
  Loader2,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import songsData from "../data/songsData";

const SORT_OPTIONS = [
  { value: "default", label: "Default", icon: Sparkles },
  { value: "a-z", label: "A → Z", icon: ArrowUpDown },
  { value: "z-a", label: "Z → A", icon: ArrowUpDown },
  { value: "newest", label: "Newest First", icon: TrendingUp },
  { value: "oldest", label: "Oldest First", icon: TrendingUp },
];

const BATCH_SIZE = 24;

export default function Home() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  const [sortBy, setSortBy] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const sortRef = useRef(null);

  // Sync URL search param with state
  useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
      setVisibleCount(BATCH_SIZE);
    }
  }, [urlSearch]);

  // Stats
  const totalSongs = songsData.length;
  const uniqueMovies = useMemo(
    () => new Set(songsData.map((s) => s.movie)).size,
    []
  );
  const uniqueSingers = useMemo(() => {
    const set = new Set();
    songsData.forEach((s) => {
      if (s.singers)
        s.singers.split(",").forEach((n) => set.add(n.trim()));
    });
    return set.size;
  }, []);

  // Filter
  const filteredSongs = useMemo(() => {
    const q = search.toLowerCase();
    return songsData
      .map((song, index) => ({ ...song, originalIndex: index }))
      .filter(
        (song) =>
          song.title.toLowerCase().includes(q) ||
          song.movie.toLowerCase().includes(q) ||
          song.singers.toLowerCase().includes(q) ||
          (song.lyricist && song.lyricist.toLowerCase().includes(q)) ||
          (song.music && song.music.toLowerCase().includes(q))
      );
  }, [search]);

  // Sort
  const sortedSongs = useMemo(() => {
    const songs = [...filteredSongs];
    switch (sortBy) {
      case "a-z":
        return songs.sort((a, b) => a.title.localeCompare(b.title));
      case "z-a":
        return songs.sort((a, b) => b.title.localeCompare(a.title));
      case "newest":
        return songs.reverse();
      case "oldest":
        return songs;
      default:
        return songs;
    }
  }, [filteredSongs, sortBy]);

  // Visible songs
  const displayedSongs = sortedSongs.slice(0, visibleCount);
  const hasMore = visibleCount < sortedSongs.length;

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 400);
  };

  // Close dropdown on outside click
  if (typeof window !== "undefined") {
    // handled via onBlur
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-b from-sky-50/80 via-white to-white pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          {/* Badge */}
          <div className="fade-in">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              {totalSongs.toLocaleString()}+ Songs Available
            </span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 leading-[1.1] tracking-tight fade-in stagger-1"
          >
            Discover{" "}
            <span className="gradient-text">Tamil Song</span>{" "}
            Lyrics
          </h1>

          <p className="text-slate-500 text-base md:text-lg font-medium mb-10 max-w-2xl mx-auto fade-in stagger-2">
            உங்கள் விருப்பமான தமிழ் பாடல்களின் வரிகளை தமிழ் மற்றும் ஆங்கிலத்தில்
            எளிதாகக் கண்டறியுங்கள்
          </p>

          {/* Search */}
          <div
            id="search"
            className={`relative max-w-2xl mx-auto fade-in stagger-3 transition-all duration-300 ${
              isSearchFocused ? "scale-[1.02]" : ""
            }`}
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search
                size={20}
                strokeWidth={2}
                className={`transition-colors duration-300 ${
                  isSearchFocused ? "text-sky-500" : "text-slate-300"
                }`}
              />
            </div>
            <input
              ref={searchRef}
              type="text"
              value={search}
              placeholder="Search by song, movie, or singer..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-base font-medium outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 shadow-sm hover:shadow-md transition-all duration-300"
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(BATCH_SIZE);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              id="search-input"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10 fade-in stagger-4">
            {[
              { icon: Music, value: totalSongs, label: "Songs", color: "text-sky-500" },
              { icon: Film, value: uniqueMovies, label: "Movies", color: "text-teal-500" },
              { icon: Mic, value: uniqueSingers, label: "Artists", color: "text-violet-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 font-extrabold text-2xl md:text-3xl text-slate-800">
                  <stat.icon size={20} strokeWidth={2} className={stat.color} />
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SONGS SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header Row: Title + Sort */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Music size={20} strokeWidth={2} className="text-sky-500" />
              {search ? `Results for "${search}"` : "All Songs"}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              {sortedSongs.length.toLocaleString()} songs found
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              onBlur={() => setTimeout(() => setSortOpen(false), 200)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all duration-200"
              id="sort-btn"
            >
              <ArrowUpDown size={15} strokeWidth={2} />
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {sortOpen && (
              <div className="dropdown-menu">
                <div className="p-1.5">
                  {SORT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortOpen(false);
                          setVisibleCount(BATCH_SIZE);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          sortBy === option.value
                            ? "bg-sky-50 text-sky-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={14} strokeWidth={2} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Song Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedSongs.map((song, i) => (
            <Link
              href={`/song/${song.originalIndex}`}
              key={song.originalIndex}
              id={`song-card-${song.originalIndex}`}
            >
              <div
                className="cinema-card p-5 cursor-pointer h-full flex flex-col fade-in"
                style={{ animationDelay: `${Math.min(i, 12) * 0.03}s` }}
              >
                {/* Title */}
                <h3 className="font-bold text-slate-800 text-[15px] mb-1.5 line-clamp-1 group-hover:text-sky-600 transition-colors">
                  {song.title}
                </h3>

                {/* Movie */}
                <p className="text-sm text-slate-400 font-medium mb-3 line-clamp-1 flex items-center gap-1">
                  <Film size={12} strokeWidth={2} className="text-slate-300 shrink-0" />
                  {song.movie}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {song.singers && song.singers !== "Unknown" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                      <Mic size={10} strokeWidth={2.5} />
                      <span className="truncate max-w-[100px]">
                        {song.singers.split(",")[0].trim()}
                      </span>
                    </span>
                  )}
                  {song.music && song.music !== "Unknown" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                      <Disc3 size={10} strokeWidth={2.5} />
                      <span className="truncate max-w-[100px]">
                        {song.music}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoadingMore && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 border border-slate-100">
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-20 !rounded-full" />
                  <div className="skeleton h-6 w-16 !rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {displayedSongs.length === 0 && !isLoadingMore && (
          <div className="text-center py-24 fade-in">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              No Songs Found
            </h3>
            <p className="text-slate-400 font-medium">
              Try a different search term
            </p>
          </div>
        )}

        {/* Load More */}
        {hasMore && !isLoadingMore && displayedSongs.length > 0 && (
          <div className="flex flex-col items-center mt-12 gap-3">
            <button onClick={loadMore} className="load-more-btn" id="load-more">
              <Loader2
                size={18}
                strokeWidth={2.5}
                className={isLoadingMore ? "animate-spin" : ""}
              />
              Load More Songs
            </button>
            <p className="text-xs text-slate-400 font-medium">
              Showing {displayedSongs.length} of{" "}
              {sortedSongs.length.toLocaleString()}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}