import Link from "next/link";
import { Music, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-sky-500/20">
              <Music size={18} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">TamilPaadalgal</h3>
              <p className="text-xs text-slate-400 font-medium">
                Your Tamil Lyrics Companion
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-sky-500 transition-colors">Home</Link>
            <Link href="/?view=movies" className="hover:text-sky-500 transition-colors">Movies</Link>
            <Link href="/?view=singers" className="hover:text-sky-500 transition-colors">Singers</Link>
            <Link href="/?view=lyricists" className="hover:text-sky-500 transition-colors">Lyricists</Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/60 my-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-medium">
            © 2025 TamilPaadalgal. All lyrics belong to their respective owners.
          </p>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> for Tamil music lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
