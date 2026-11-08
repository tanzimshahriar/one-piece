'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useState } from 'react';
import { Arrow } from '../art/Glyphs';

type Item = { href: string; no: string; title: string; jp: string; blurb: string; image: string; count?: string };

/** Table of contents where a halftone print of each section trails the cursor. */
export function ContentsList({ items }: { items: Item[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 26 });
  const y = useSpring(my, { stiffness: 260, damping: 26 });

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <ol className="border-t-[3px] border-ink">
        {items.map((item, i) => (
          <li key={item.href} className="border-b border-ink/30">
            <Link
              href={item.href}
              onPointerEnter={() => setHover(i)}
              className="group grid grid-cols-12 items-center gap-4 py-5 md:py-6"
              data-cursor="Enter"
            >
              <span className="t-kicker col-span-2 text-[11px] text-ink-soft md:col-span-1">{item.no}</span>
              <span className="col-span-10 md:col-span-6">
                <span className="t-display block text-[clamp(1.9rem,5vw,4.4rem)] leading-[0.95] transition-[transform,color] duration-500 ease-out group-hover:translate-x-4 group-hover:text-red">
                  {item.title}
                </span>
              </span>
              <span className="col-span-10 col-start-3 text-[15px] text-ink-soft md:col-span-3 md:col-start-auto">
                <span className="t-kicker mb-1 block text-[10px] text-ink">{item.jp}</span>
                {item.blurb}
              </span>
              <span className="t-kicker col-span-2 hidden items-center justify-end gap-3 text-[11px] md:flex">
                {item.count && <span className="num text-ink-soft">{item.count}</span>}
                <span className="grid h-10 w-10 place-items-center border-2 border-ink transition-colors group-hover:bg-ink group-hover:text-paper">
                  <Arrow />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <motion.div className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block" style={{ x, y }} aria-hidden>
        <AnimatePresence>
          {hover !== null && (
            <motion.div
              key={hover}
              className="-translate-x-1/2 -translate-y-1/2 overflow-hidden border-[3px] border-ink bg-paper"
              style={{ width: 260, height: 320, rotate: hover % 2 ? 4 : -4 }}
              initial={{ clipPath: 'inset(50% 50% 50% 50%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              exit={{ clipPath: 'inset(50% 50% 50% 50%)', transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={items[hover].image} alt="" className="h-full w-full object-cover object-top" style={{ filter: 'grayscale(1) contrast(1.2)', mixBlendMode: 'multiply' }} />
              <div className="tone-dots absolute inset-0 opacity-25 mix-blend-multiply" />
              <span className="t-display absolute bottom-2 left-2 bg-red px-2 py-1 text-sm text-paper">{items[hover].jp}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
