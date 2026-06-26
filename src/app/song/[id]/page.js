"use client";
import { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Minus,
  Plus,
  Music,
  ChevronLeft,
  ChevronRight,
  Film,
  Mic,
  PenTool,
  Disc3,
} from "lucide-react";
import songsData from "../../../data/songsData";

export default function SongPage({ params }) {
  const { id } = use(params);
  const songId = parseInt(id);
  const song = songsData[songId];

  const [lang, setLang] = useState(song?.lyrics_tamil ? "tamil" : "english");
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const displayLyrics = useMemo(() => {
    if (!song) return "";
    if (lang === "tamil") return song.lyrics_tamil || "";
    return song.lyrics || "";
  }, [song, lang]);

  // Smart copy — appends domain
  const handleCopy = useCallback(async () => {
    const domain =
      typeof window !== "undefined" ? window.location.origin : "https://tamilpaadalgal.com";
    const textToCopy = `${displayLyrics}\n\nRead more at: ${domain}/song/${songId}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [displayLyrics, songId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${song.title} - Lyrics`,
          text: `Check out the lyrics of "${song.title}" from ${song.movie}`,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  // Navigation
  const prevSong = songId > 0 ? songId - 1 : null;
  const nextSong = songId < songsData.length - 1 ? songId + 1 : null;

  // Related: same movie
  const sameMovieSongs = useMemo(() => {
    if (!song || !song.movie || song.movie === "Unknown") return [];
    return songsData
      .map((s, i) => ({ ...s, originalIndex: i }))
      .filter(
        (s) =>
          s.movie.toLowerCase() === song.movie.toLowerCase() &&
          s.originalIndex !== songId
      )
      .slice(0, 6);
  }, [song, songId]);

  // Related: same singer
  const sameSingerSongs = useMemo(() => {
    if (!song || !song.singers || song.singers === "Unknown") return [];
    const current = song.singers
      .toLowerCase()
      .split(",")
      .map((s) => s.trim());
    return songsData
      .map((s, i) => ({ ...s, originalIndex: i }))
      .filter((s) => {
        if (s.originalIndex === songId || !s.singers) return false;
        const other = s.singers
          .toLowerCase()
          .split(",")
          .map((x) => x.trim());
        return current.some((c) =>
          other.some((o) => o.includes(c) || c.includes(o))
        );
      })
      .slice(0, 6);
  }, [song, songId]);

  // Not found
  if (!song)
    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center gap-4">
        <div className="text-6xl">🎵</div>
        <h2 className="text-2xl font-bold text-slate-600">Song Not Found</h2>
        <Link href="/" className="pill-btn gradient-primary text-white shadow-lg shadow-sky-500/25">
          <ArrowLeft size={16} /> Go Home
        </Link>
      </div>
    );

  const isValid = (t) => t && t !== "Unknown" && t.length > 1;

  const metaItems = [
    { icon: Film, label: "Movie", value: song.movie, color: "bg-violet-50 text-violet-600 border-violet-100" },
    { icon: Mic, label: "Singers", value: song.singers, color: "bg-sky-50 text-sky-600 border-sky-100" },
    { icon: Disc3, label: "Music", value: song.music, color: "bg-teal-50 text-teal-600 border-teal-100" },
    { icon: PenTool, label: "Lyricist", value: song.lyricist, color: "bg-amber-50 text-amber-600 border-amber-100" },
  ].filter((m) => isValid(m.value));

  return (
    <div className="min-h-screen bg-white">
      {/* ===== CINEMATIC HEADER ===== */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-sky-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-10 z-10">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-sky-500 transition-colors mb-8 fade-in"
            id="back-btn"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to Songs
          </Link>

          {/* Title Block */}
          <div className="text-center fade-in stagger-1">
            {/* Movie pill */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-semibold mb-5">
              <Film size={12} strokeWidth={2.5} />
              {isValid(song.movie) ? song.movie : "Album Song"}
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              {song.title}
            </h1>
          </div>

          {/* Metadata Cards */}
          <div className="flex flex-wrap justify-center gap-3 fade-in stagger-2">
            {metaItems.map((meta, i) => {
              const Icon = meta.icon;
              return (
                <div
                  key={meta.label}
                  className={`cinema-card !hover:transform-none px-4 py-2.5 flex items-center gap-2.5`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${meta.color} border flex items-center justify-center`}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {meta.label}
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {meta.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== LYRICS SECTION ===== */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 pt-4">
        {/* Controls */}
        <div className="sticky top-16 z-10 mb-6 fade-in stagger-3">
          <div className="glass-strong rounded-2xl p-2 flex flex-wrap items-center gap-2 shadow-sm">
            {/* Language Toggle */}
            <div className="flex-1 flex bg-slate-100/80 rounded-xl p-1">
              <button
                onClick={() => setLang("tamil")}
                disabled={!song.lyrics_tamil}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  lang === "tamil"
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                } ${!song.lyrics_tamil ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                id="tab-tamil"
              >
                தமிழ் {song.lyrics_tamil ? "" : "(N/A)"}
              </button>
              <button
                onClick={() => setLang("english")}
                disabled={!song.lyrics}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  lang === "english"
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                } ${!song.lyrics ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                id="tab-english"
              >
                English {song.lyrics ? "" : "(N/A)"}
              </button>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-0.5 bg-slate-100/80 rounded-xl p-1">
              <button
                onClick={() => setFontSize((p) => Math.max(14, p - 2))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                id="font-decrease"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="text-xs font-semibold text-slate-400 w-7 text-center">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize((p) => Math.min(30, p + 2))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                id="font-increase"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                copied
                  ? "bg-emerald-50 text-emerald-500"
                  : "bg-slate-100/80 text-slate-400 hover:bg-sky-50 hover:text-sky-500"
              }`}
              title="Copy Lyrics"
              id="copy-btn"
            >
              {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={2} />}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100/80 text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-all"
              title="Share"
              id="share-btn"
            >
              <Share2 size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Lyrics — clean, only lyrics text */}
        <div className="fade-in stagger-4">
          <div className="cinema-card !hover:transform-none rounded-2xl p-8 md:p-12">
            <div
              className="whitespace-pre-wrap text-center lyrics-container"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily:
                  lang === "tamil"
                    ? "var(--font-hind-madurai), 'Noto Sans Tamil', sans-serif"
                    : "var(--font-outfit), 'Outfit', sans-serif",
                lineHeight: lang === "tamil" ? "2.4" : "2.2",
                letterSpacing: lang === "tamil" ? "0.02em" : "0.01em",
                fontWeight: lang === "tamil" ? 400 : 400,
                color: "#1E293B",
              }}
            >
              {displayLyrics || (
                <span className="text-slate-400 italic font-medium text-base">
                  {lang === "tamil"
                    ? "தமிழ் வரிகள் விரைவில்..."
                    : "English lyrics coming soon..."}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        {copied && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-enter">
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-xl">
              <Check size={16} strokeWidth={2.5} className="text-emerald-400" />
              Lyrics copied to clipboard!
            </div>
          </div>
        )}

        {/* Prev / Next Navigation */}
        <div className="flex justify-between items-center mt-8 gap-4 fade-in stagger-5">
          {prevSong !== null ? (
            <Link
              href={`/song/${prevSong}`}
              className="flex-1 cinema-card p-4 flex items-center gap-3"
              id="prev-song"
            >
              <ChevronLeft size={18} strokeWidth={2} className="text-slate-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Previous
                </p>
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {songsData[prevSong]?.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextSong !== null ? (
            <Link
              href={`/song/${nextSong}`}
              className="flex-1 cinema-card p-4 flex items-center justify-end gap-3 text-right"
              id="next-song"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Next
                </p>
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {songsData[nextSong]?.title}
                </p>
              </div>
              <ChevronRight size={18} strokeWidth={2} className="text-slate-300 shrink-0" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </section>

      {/* ===== RELATED SONGS ===== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Same Movie */}
        {sameMovieSongs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <Film size={14} strokeWidth={2} className="text-violet-400" />
                More from &quot;{song.movie}&quot;
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sameMovieSongs.map((rel) => (
                <Link key={rel.originalIndex} href={`/song/${rel.originalIndex}`}>
                  <div className="cinema-card p-4 flex items-center gap-3 cursor-pointer">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                      <Music size={14} strokeWidth={2} className="text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-700 truncate">{rel.title}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">🎤 {rel.singers}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Same Singer */}
        {sameSingerSongs.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <Mic size={14} strokeWidth={2} className="text-sky-400" />
                More by {song.singers?.split(",")[0]?.trim()}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sameSingerSongs.map((rel) => (
                <Link key={rel.originalIndex} href={`/song/${rel.originalIndex}`}>
                  <div className="cinema-card p-4 flex items-center gap-3 cursor-pointer">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                      <Mic size={14} strokeWidth={2} className="text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-700 truncate">{rel.title}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">🎬 {rel.movie}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}