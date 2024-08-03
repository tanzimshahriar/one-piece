import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local'

const inter = Inter({subsets: ['latin'], variable: '--font-inter'})
const onePieceFont = localFont({src: '../font/One Piece - PERSONAL USE.woff', variable: '--font-one-piece'})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${onePieceFont.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
