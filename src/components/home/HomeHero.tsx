'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useReducedMotionSafe } from '../ui/Motion';
import { useRef } from 'react';
import { HalftoneSea } from '../art/HalftoneSea';
import { Arrow } from '../art/Glyphs';
import { StrawHat } from '../art/StrawHat';

const EASE = [0.16, 1, 0.3, 1] as const;

function Letters({ word, delay }: { word: string; delay: number }) {
  const reduced = useReducedMotionSafe();
  return (
    <span className="inline-flex">
      {word.split('').map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '-115%', rotate: i % 2 ? 8 : -8, opacity: 0 }}
          animate={{ y: '0%', rotate: 0, opacity: 1 }}
          transition={{ delay: delay + i * 0.06, type: 'spring', stiffness: 260, damping: 17 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export function HomeHero({ characters, islands, episodes }: { characters: number; islands: number; episodes: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const hatX = useTransform(scrollYProgress, [0, 0.7], [0, 520]);
  const hatY = useTransform(scrollYProgress, [0, 0.7], [0, -380]);
  const hatR = useTransform(scrollYProgress, [0, 0.7], [12, 220]);
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // The intro card covers the first ~1.6s of a fresh session.
  const base = typeof document !== 'undefined' && document.documentElement.dataset.intro === 'seen' ? 0.2 : 1.6;

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden" aria-label="Grand Line">
      <HalftoneSea className="absolute inset-0" />

      <div className="page-x t-kicker absolute inset-x-0 top-[calc(var(--header-h)+6px)] z-10 flex justify-between text-[10px]">
        <span className="bg-paper/90 px-1.5 py-1">Vol. 01 · Est. Chapter 1, 1997</span>
        <span className="hidden bg-paper/90 px-1.5 py-1 sm:block">The Great Pirate Era · 大海賊時代</span>
      </div>

      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pb-[14vh]"
        style={reduced ? undefined : { y: titleY, scale: titleScale }}
      >
        <h1
          className="t-display text-center text-[clamp(4.4rem,17vw,17.5rem)] uppercase leading-[0.8] text-ink"
          style={{ WebkitTextStroke: '0.07em var(--paper)', paintOrder: 'stroke fill' }}
        >
          <span className="relative inline-block">
            <Letters word="GRAND" delay={base} />
            <motion.span
              className="absolute right-[-0.42em] top-[-0.3em] block w-[0.98em]"
              style={reduced ? { rotate: 12 } : { x: hatX, y: hatY, rotate: hatR }}
            >
              <motion.span
                className="block"
                initial={{ y: -400, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: base + 0.75, type: 'spring', stiffness: 120, damping: 11 }}
              >
                <StrawHat className="w-full drop-shadow-[0_8px_0_rgba(18,17,16,0.15)]" />
              </motion.span>
            </motion.span>
          </span>
          <br />
          <span className="inline-block">
            <Letters word="LINE" delay={base + 0.28} />
          </span>
        </h1>
        <motion.p
          className="t-ital relative mt-7 max-w-[36ch] border-2 border-ink bg-paper px-5 py-3 text-center text-[clamp(1.05rem,1.9vw,1.55rem)] leading-snug shadow-[5px_5px_0_var(--ink)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: base + 0.9, duration: 1, ease: EASE }}
        >
          The One Piece almanac — every pirate, fruit, island &amp; bounty on the seas, drawn in ink.
        </motion.p>
      </motion.div>

      <motion.span
        aria-hidden
        className="sfx absolute left-[3%] top-[15%] z-20 hidden text-[clamp(2.4rem,5.6vw,6rem)] md:block"
        initial={{ scale: 3, opacity: 0, rotate: -40 }}
        animate={{ scale: 1, opacity: 1, rotate: -14 }}
        transition={{ delay: base + 1.05, type: 'spring', stiffness: 400, damping: 16 }}
      >
        ドン!!
      </motion.span>

      <div className="absolute right-[var(--gutter)] top-[24%] z-10 hidden lg:block" aria-hidden>
        <span className="tategaki t-display block bg-paper/85 px-1 py-2 text-[26px] leading-none">偉大なる航路</span>
      </div>

      <motion.div style={reduced ? undefined : { opacity: fade }} className="page-x absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 pb-6">
        <div className="flex flex-wrap gap-2">
          <Link href="/characters" className="btn-ink" data-cursor="Board">
            Meet the cast <Arrow />
          </Link>
          <Link href="/world" className="btn-line hidden border-ink bg-paper text-ink sm:inline-flex" data-cursor="Chart">
            Open the chart
          </Link>
        </div>
        <dl className="t-kicker hidden gap-6 bg-ink px-4 py-3 text-[10px] text-paper md:flex">
          <div>
            <dt className="text-paper/50">Souls</dt>
            <dd className="num mt-1 text-sm">{characters.toLocaleString('en-US')}</dd>
          </div>
          <div>
            <dt className="text-paper/50">Islands</dt>
            <dd className="num mt-1 text-sm">{islands}</dd>
          </div>
          <div>
            <dt className="text-paper/50">Episodes</dt>
            <dd className="num mt-1 text-sm">{episodes.toLocaleString('en-US')}</dd>
          </div>
        </dl>
        <div className="t-kicker flex flex-col items-center gap-2 bg-paper px-2 py-2 text-[10px]">
          <span className="tategaki">出航</span>
          <span className="block h-10 w-[2px] origin-top animate-[bob_2s_ease-in-out_infinite] bg-ink" />
        </div>
      </motion.div>
    </section>
  );
}
