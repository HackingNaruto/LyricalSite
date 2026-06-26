"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center gap-4 px-4">
      <div className="text-7xl">🎵</div>
      <h2 className="text-2xl font-bold text-slate-700">Page Not Found</h2>
      <p className="text-slate-400 font-medium">This page doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="pill-btn gradient-primary text-white shadow-lg shadow-sky-500/25 mt-2">
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </div>
  );
}
