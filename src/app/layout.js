import { Outfit, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-hind-madurai",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "TamilPaadalgal - Tamil Song Lyrics | தமிழ் பாடல் வரிகள்",
  description:
    "Discover and explore thousands of Tamil movie song lyrics in Tamil and English. Your ultimate Tamil lyrics companion.",
  keywords:
    "Tamil lyrics, Tamil songs, Tamil paadal, Tamil movie songs, song lyrics, தமிழ் பாடல், பாடல் வரிகள்",
  openGraph: {
    title: "TamilPaadalgal - Tamil Song Lyrics",
    description:
      "Discover thousands of Tamil movie song lyrics in Tamil and English.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${notoSansTamil.variable} font-sans`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}