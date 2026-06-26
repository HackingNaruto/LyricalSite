"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Menu, X, Home, Film, Mic, PenTool } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/?view=movies", label: "Movies A-Z", icon: Film },
  { href: "/?view=singers", label: "Singers", icon: Mic },
  { href: "/?view=lyricists", label: "Lyricists", icon: PenTool },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass-strong gradient-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all duration-300">
              <Music size={18} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight">
                TamilPaadalgal
              </h1>
              <p className="text-[10px] font-medium text-slate-400 -mt-0.5">
                பாடல் வரிகள்
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-sky-50 text-sky-600"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                  id={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Icon size={15} strokeWidth={2} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            id="nav-toggle"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-all"
              >
                <Icon size={16} strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
