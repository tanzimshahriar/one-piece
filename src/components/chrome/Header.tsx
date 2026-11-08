'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { SECTIONS, SECTION_ART } from '@/lib/curated';
import { SpeedLines } from '../art/Glyphs';
import { useApp } from './Providers';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const { setSearchOpen, lenis } = useApp();
  const current = SECTIONS.find((s) => pathname.startsWith(s.href));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[120] text-white mix-blend-difference">
        <div className="page-x flex h-[var(--header-h)] items-center justify-between gap-4">
          <Link href="/" className="pointer-events-auto group flex items-center gap-3" aria-label="Grand Line — home">
            <span className="t-display text-[22px] leading-none tracking-tight">GRAND LINE</span>
            <span className="hidden h-5 w-px bg-current opacity-50 sm:block" />
            <span className="t-kicker hidden text-[10px] opacity-80 sm:block">ワンピース大全</span>
          </Link>

          <div className="t-kicker hidden items-center gap-3 text-[10px] opacity-80 lg:flex">
            {current ? (
              <>
                <span>§{current.no}</span>
                <span className="h-px w-8 bg-current" />
                <span>{current.title}</span>
                <span className="opacity-60">{current.jp}</span>
              </>
            ) : (
              <span>The One Piece Almanac · Est. Chapter 1</span>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-2 sm:gap-5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="t-kicker flex items-center gap-2 py-2 text-[11px]"
              data-cursor="Search"
              aria-label="Search the almanac"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
                <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.6" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden border border-current px-1.5 py-0.5 text-[9px] opacity-70 md:inline">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="t-kicker flex items-center gap-3 py-2 text-[11px]"
              aria-expanded={open}
              aria-controls="site-menu"
              data-cursor="Open"
            >
              <span>Menu</span>
              <span className="flex w-6 flex-col gap-[5px]" aria-hidden>
                <span className="h-[2px] w-full bg-current" />
                <span className="h-[2px] w-2/3 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu"
            aria-label="Main"
            className="fixed inset-0 z-[130] overflow-hidden bg-ink text-paper"
            initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            exit={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
            transition={{ duration: 0.75, ease: [0.7, 0, 0.2, 1] }}
            data-lenis-prevent
          >
            <SpeedLines seed={`menu-${hover}`} inner={0.62} className="pointer-events-none absolute inset-0 h-full w-full text-paper opacity-[0.07]" />

            <div className="page-x relative flex h-[var(--header-h)] items-center justify-between">
              <span className="t-display text-[22px]">GRAND LINE</span>
              <button type="button" onClick={() => setOpen(false)} className="t-kicker flex items-center gap-3 py-2 text-[11px]" data-cursor="Close" autoFocus>
                Close
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="2.4" />
                </svg>
              </button>
            </div>

            <div className="page-x relative grid h-[calc(100svh-var(--header-h))] grid-cols-12 gap-6 overflow-y-auto pb-8">
              <ul className="col-span-12 flex flex-col justify-center lg:col-span-7">
                {SECTIONS.map((s, i) => (
                  <motion.li
                    key={s.href}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.045, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-paper/15"
                  >
                    <Link
                      href={s.href}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      className="group flex items-baseline gap-4 py-2 sm:gap-6 md:py-2.5"
                      aria-current={pathname.startsWith(s.href) ? 'page' : undefined}
                    >
                      <span className="t-kicker w-8 shrink-0 text-[10px] text-paper/50">{s.no}</span>
                      <span className="t-display text-[clamp(1.9rem,5.2vw,4.4rem)] leading-[0.95] transition-[transform,color] duration-500 ease-out group-hover:translate-x-3 group-hover:text-red group-aria-[current=page]:text-straw">
                        {s.title}
                      </span>
                      <span className="t-kicker ml-auto hidden text-[11px] text-paper/50 sm:block">{s.jp}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="relative col-span-5 hidden flex-col justify-center lg:flex">
                <div className="relative aspect-[4/5] w-full max-w-[460px] self-end overflow-hidden border-[3px] border-paper bg-paper">
                  <AnimatePresence mode="popLayout">
                    <motion.img
                      key={hover}
                      src={SECTION_ART[SECTIONS[hover].href]}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-top"
                      style={{ filter: 'grayscale(1) contrast(1.2)', mixBlendMode: 'multiply' }}
                      initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.15 }}
                      animate={{ clipPath: 'inset(0% 0 0 0)', scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </AnimatePresence>
                  <div className="tone-dots pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply" style={{ ['--tone' as string]: 'var(--ink)' }} />
                  <div className="absolute inset-x-0 bottom-0 bg-ink p-5">
                    <p className="t-kicker text-[10px] text-straw">§{SECTIONS[hover].no} — {SECTIONS[hover].jp}</p>
                    <p className="t-ital mt-2 text-2xl leading-tight">{SECTIONS[hover].blurb}</p>
                  </div>
                </div>
                <p className="t-kicker mt-6 self-end text-[10px] text-paper/40">Press / or ⌘K to search anywhere</p>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
