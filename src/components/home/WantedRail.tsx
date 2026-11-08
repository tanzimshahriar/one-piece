'use client';

import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useReducedMotionSafe } from '../ui/Motion';
import { useEffect, useRef, useState } from 'react';
import type { Wanted } from '@/lib/data/bounties';
import { Arrow, SpeedLines } from '../art/Glyphs';
import { WantedPoster } from '../ui/Cards';

/** Pinned section: vertical scroll drives a horizontal wall of wanted posters. */
export function WantedRail({ wanted }: { wanted: Wanted[] }) {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const [distance, setDistance] = useState(0);
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => setIndex(Math.min(wanted.length - 1, Math.floor(v * wanted.length))));

  const current = wanted[index];

  return (
    <section ref={outer} className="relative bg-ink text-paper" style={{ height: reduced ? 'auto' : `calc(100svh + ${distance}px)` }} aria-label="Most wanted">
      <div className={`${reduced ? '' : 'sticky top-0 h-[100svh]'} flex flex-col overflow-hidden`}>
        <SpeedLines seed="wanted-rail" inner={0.5} className="pointer-events-none absolute inset-0 h-full w-full text-paper opacity-[0.06]" />
        <div className="page-x relative flex items-end justify-between gap-6 pt-[calc(var(--header-h)+3vh)]">
          <div>
            <p className="t-kicker text-[10px] text-straw">§02 · 手配書 · Ranked by the Marines</p>
            <h2 className="t-display mt-3 text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.85]">MOST WANTED</h2>
          </div>
          <div className="hidden text-right md:block">
            <p className="t-display num text-[clamp(3rem,7vw,6.5rem)] leading-none text-red">{String(index + 1).padStart(2, '0')}</p>
            <p className="t-kicker mt-2 max-w-[24ch] truncate text-[10px] text-paper/60">{current?.name}</p>
          </div>
        </div>

        <motion.div
          ref={track}
          style={reduced ? undefined : { x }}
          className={`relative mt-6 flex flex-1 items-center gap-8 pl-[var(--gutter)] pr-[30vw] ${reduced ? 'overflow-x-auto pb-10' : ''}`}
        >
          {wanted.map((w, i) => (
            <div
              key={w.characterId}
              className="relative w-[min(64vw,300px)] shrink-0 md:w-[min(28vw,320px)]"
              style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (1.5 + (i % 3))}deg) translateY(${(i % 3) * 14 - 14}px)` }}
            >
              <span className="absolute -top-3 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-ink bg-red shadow-[0_3px_0_rgba(0,0,0,0.4)]" aria-hidden />
              <WantedPoster name={w.name} image={w.image} amount={w.amount} status={w.status} href={w.href} rank={w.rank} />
            </div>
          ))}
          <Link
            href="/bounties"
            className="group flex h-[min(70vh,520px)] w-[min(64vw,300px)] shrink-0 flex-col items-center justify-center gap-6 border-[3px] border-dashed border-paper/40 text-center transition-colors hover:border-red md:w-[min(28vw,320px)]"
            data-cursor="All"
          >
            <span className="t-display text-4xl leading-none">
              The whole
              <br />
              board
            </span>
            <span className="t-kicker flex items-center gap-2 text-[11px] text-straw">
              Every bounty on file <Arrow />
            </span>
          </Link>
        </motion.div>

        <div className="page-x relative mb-6 flex items-center gap-4">
          <span className="t-kicker text-[10px] text-paper/50">Scroll</span>
          <div className="h-[3px] flex-1 bg-paper/15">
            <motion.div className="h-full origin-left bg-red" style={{ scaleX: scrollYProgress }} />
          </div>
          <span className="t-kicker num text-[10px] text-paper/50">{wanted.length} posters</span>
        </div>
      </div>
    </section>
  );
}
