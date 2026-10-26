import Image from 'next/image';
import Link from 'next/link';
import CharactersContainer from '@/components/CharactersContainer';
import { characters } from '../../characters';

export default function Home() {
  return (
    <main className="archive-shell min-h-screen overflow-hidden text-white">
      <header className="site-header">
        <div className="page-width flex h-[72px] items-center justify-between">
          <Link href="/" aria-label="One Piece archive home" className="brand-mark">
            <Image src="/logo.png" alt="One Piece" width={124} height={58} priority />
            <span className="brand-divider" />
            <span className="brand-caption">CHARACTER<br />ARCHIVE</span>
          </Link>
          <div className="hidden items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-white/55 sm:flex">
            <span className="status-dot" />
            GRAND LINE DATABASE
          </div>
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://github.com/tanzimshahriar/one-piece"
            className="source-link"
            aria-label="View source code on GitHub"
          >
            <Image alt="" src="/github.png" width={17} height={17} />
            <span className="hidden sm:inline">SOURCE</span>
            <span aria-hidden="true" className="source-arrow">↗</span>
          </Link>
        </div>
      </header>

      <div className="page-width">
        <div className="archive-heading">
          <div>
            <div className="eyebrow"><span>01</span> / THE WANTED INDEX</div>
            <h1>Every legend<br /><em>has a price.</em></h1>
          </div>
          <p className="heading-note">
            A living record of the pirates, allies, and outlaws shaping the age of the sea.
          </p>
        </div>

        <CharactersContainer characters={characters} />

        <footer className="archive-footer">
          <span>ONE PIECE CHARACTER ARCHIVE</span>
          <span>SAIL BEYOND THE ORDINARY <span className="footer-star">✳</span></span>
        </footer>
      </div>
    </main>
  );
}
