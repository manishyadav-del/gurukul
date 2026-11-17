import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Gurukul Astrology - Digital Astrology & Learning Platform",
  description: "Astrology knowledge and learning platform featuring classical digital books, Jyotish wisdom, search, and quizzes.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fcfaf5] text-stone-900 antialiased selection:bg-[#d4a359]/30 selection:text-[#13382c]">
        {/* Skip to Main Content Link for Keyboard & Screen Reader Users (WCAG 2.2 AA) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#13382c] focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-2 focus:outline-[#d4a359] text-xs font-semibold"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 focus:outline-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
