import type { Metadata, Viewport } from 'next';
import { Dela_Gothic_One, JetBrains_Mono, Playfair_Display, Zen_Kaku_Gothic_New } from 'next/font/google';
import { InkFilters } from '@/components/art/Glyphs';
import { Cursor } from '@/components/chrome/Cursor';
import { Footer } from '@/components/chrome/Footer';
import { Header } from '@/components/chrome/Header';
import { Intro } from '@/components/chrome/Intro';
import { Providers } from '@/components/chrome/Providers';
import { SearchPalette } from '@/components/chrome/SearchPalette';
import './globals.css';

const display = Dela_Gothic_One({ weight: '400', subsets: ['latin'], variable: '--font-display', display: 'swap' });
const serif = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Zen_Kaku_Gothic_New({ weight: ['400', '500', '700', '900'], subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const SITE = 'https://one-piece-tanzimshahriars-projects.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Grand Line — The One Piece Almanac', template: '%s · Grand Line' },
  description:
    'An illustrated almanac of the Great Pirate Era: 1,400+ characters, bounties, Devil Fruits, islands, ships, factions, every arc and every volume of One Piece.',
  openGraph: {
    title: 'Grand Line — The One Piece Almanac',
    description: 'Every pirate, fruit, island and bounty on the seas — drawn in ink.',
    url: SITE,
    siteName: 'Grand Line',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Grand Line — The One Piece Almanac' },
};

export const viewport: Viewport = {
  themeColor: '#f2e9d8',
  width: 'device-width',
  initialScale: 1,
};

const introScript = `try{if(sessionStorage.getItem('gl-intro')){document.documentElement.dataset.intro='seen'}else{sessionStorage.setItem('gl-intro','1')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body id="top">
        <InkFilters />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <Providers>
          <Intro />
          <Header />
          <SearchPalette />
          <main id="main">{children}</main>
          <Footer />
          <Cursor />
        </Providers>
      </body>
    </html>
  );
}
