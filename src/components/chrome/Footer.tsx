import Link from 'next/link';
import { SECTIONS } from '@/lib/curated';
import { Arrow, Star, WaveBand } from '../art/Glyphs';
import { StrawHat } from '../art/StrawHat';

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-paper">
      <WaveBand className="absolute -top-px left-0 h-10 w-full rotate-180 md:h-14" fill="var(--paper)" line="var(--ink)" seed="footer" />

      <div className="marquee overflow-hidden border-b border-paper/15 pb-6 pt-20 md:pt-28">
        <div className="marquee-track" style={{ ['--marquee-speed' as string]: '55s' }}>
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={k === 1}>
              {['The One Piece is real', 'ワンピースは実在する', 'Set sail', '出航', 'Inherited will', '受け継がれる意志'].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  <span className="t-display text-[clamp(3rem,9vw,8.5rem)] leading-none">{t}</span>
                  <Star className="text-[clamp(1.5rem,3vw,3rem)] text-red" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="page-x grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-12">
        <div className="col-span-2 md:col-span-5">
          <div className="flex items-end gap-4">
            <StrawHat className="w-24 -rotate-12" />
            <p className="t-display text-4xl leading-none">GRAND LINE</p>
          </div>
          <p className="t-ital mt-6 max-w-md text-2xl leading-snug text-paper/80">
            A fan-made almanac of the Great Pirate Era — drawn in ink, charted by hand, powered by open data.
          </p>
          <a href="#top" className="btn-line mt-8 border-paper text-paper hover:!bg-paper hover:!text-ink" data-cursor="Up">
            Back to the crow’s nest <Arrow dir="up" />
          </a>
        </div>

        <nav className="md:col-span-3" aria-label="Footer">
          <p className="t-kicker mb-5 text-[10px] text-straw">Contents · 目次</p>
          <ul className="space-y-2">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="group flex items-baseline gap-3">
                  <span className="t-kicker text-[10px] text-paper/40">{s.no}</span>
                  <span className="link-ink text-lg">{s.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="t-kicker mb-5 text-[10px] text-straw">Logbooks consulted · 出典</p>
          <ul className="space-y-3 text-[15px] leading-snug text-paper/80">
            <li>
              <a className="link-ink text-paper" href="https://onepieceapi.com" target="_blank" rel="noreferrer">
                onepieceapi.com
              </a>{' '}
              — characters, bounties, fruits, ships, islands, affiliations.
            </li>
            <li>
              <a className="link-ink text-paper" href="https://api-onepiece.com" target="_blank" rel="noreferrer">
                api-onepiece.com
              </a>{' '}
              — sagas, arcs, episodes, chapters, volumes, haki, swords, dials.
            </li>
            <li>
              <a className="link-ink text-paper" href="https://onepiece.fandom.com" target="_blank" rel="noreferrer">
                One Piece Wiki
              </a>{' '}
              — biographies & artwork under CC BY-SA.
            </li>
            <li>
              <a className="link-ink text-paper" href="https://anilist.co" target="_blank" rel="noreferrer">
                AniList
              </a>{' '}
              — fallback biographies.
            </li>
          </ul>
          <a
            href="https://github.com/tanzimshahriar/one-piece"
            target="_blank"
            rel="noreferrer"
            className="t-kicker mt-8 inline-flex items-center gap-2 text-[11px] text-paper"
            data-cursor="Source"
          >
            View the source on GitHub <Arrow dir="ne" />
          </a>
        </div>
      </div>

      <div className="page-x flex flex-col gap-3 border-t border-paper/15 py-6 text-[12px] text-paper/50 md:flex-row md:items-center md:justify-between">
        <p>ONE PIECE © Eiichiro Oda / Shueisha, Toei Animation. Unofficial, non-commercial fan project.</p>
        <p className="t-kicker text-[10px]">Ink · Screentone · Salt water</p>
      </div>

      <p
        aria-hidden
        className="t-display pointer-events-none select-none whitespace-nowrap text-center leading-[0.78] text-paper/[0.06]"
        style={{ fontSize: 'clamp(5rem, 24vw, 26rem)' }}
      >
        ワンピース
      </p>
    </footer>
  );
}
