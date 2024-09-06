import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const onePieceFont = localFont({ src: '../font/One Piece - PERSONAL USE.woff', variable: '--font-one-piece' });

export const metadata: Metadata = {
  title: "One Piece Characters Database",
  description: "Discover and explore the world of One Piece characters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>One Piece Characters Database</title>
        <meta name="description" content="Discover and explore the world of One Piece characters." />

        <meta property="og:title" content="One Piece Characters Database" />
        <meta property="og:description" content="Explore details about your favorite One Piece characters." />
        <meta property="og:image" content="/characters/1.png" />
        <meta property="og:url" content="https://one-piece-tanzimshahriars-projects.vercel.app/" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="One Piece Characters Database" />
        <meta name="twitter:description" content="Discover and explore the world of One Piece characters." />
        <meta name="twitter:image" content="/characters/1.png" />

        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${onePieceFont.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
