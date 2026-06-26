"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`scroll-top-btn ${visible ? "visible" : ""}`}
      id="scroll-top"
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
}
