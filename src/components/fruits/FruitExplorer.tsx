'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { FruitGlyph } from '../art/FruitGlyph';

export type FruitLite = {
  slug: string;
  name: string;
  english?: string;
  jp?: string;
  type: string;
  image?: string;
  users: string[];
  blurb?: string;
};

export function FruitExplorer({ fruits, types, initialType }: { fruits: FruitLite[]; types: Array<{ key: string; label: string; jp: string; count: number }>; initialType?: string }) {
  const [type, setType] = useState<string>(initialType && types.some((t) => t.key === initialType) ? initialType : '');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return fruits.filter((f) => {
      if (type && !(type === 'Zoan' ? f.type.includes('Zoan') : f.type === type)) return false;
      if (query && ![f.name, f.english, f.jp, ...f.users].some((v) => v?.toLowerCase().includes(query))) return false;
      return true;
    });
  }, [fruits, type, q]);

  return (
    <div>
      <div className="relative">
        <label htmlFor="fruit-q" className="sr-only">
          Search fruits or their users
        </label>
        <input id="fruit-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a fruit, or who ate it…" className="field pr-28" autoComplete="off" />
        <span className="t-kicker absolute bottom-4 right-0 text-[10px] text-ink-soft">{shown.length} fruits</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Fruit type">
        <button type="button" className="chip" aria-pressed={!type} onClick={() => setType('')}>
          All <span className="count">{fruits.length}</span>
        </button>
        {types.map((t) => (
          <button key={t.key} type="button" className="chip" aria-pressed={type === t.key} onClick={() => setType(type === t.key ? '' : t.key)}>
            {t.label} <span className="count">{t.count}</span>
          </button>
        ))}
      </div>

      <motion.ol layout className="mt-10 grid grid-cols-2 gap-[10px] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <AnimatePresence initial={false}>
          {shown.map((f) => (
            <motion.li
              key={f.slug}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/devil-fruits/${f.slug}`} className="group panel flex h-full flex-col p-4 transition-colors hover:bg-paper-2" data-cursor="Taste">
                <div className="flex items-start justify-between gap-2">
                  <span className="t-kicker text-[9px] text-ink-soft">{f.type}</span>
                  {f.jp && <span className="truncate text-[11px] text-ink-soft">{f.jp}</span>}
                </div>
                <div className="relative mx-auto my-4 grid aspect-square w-[72%] place-items-center">
                  <div className="tone-dots absolute inset-[12%] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-25" />
                  {f.image ? (
                    <img src={f.image} alt="" loading="lazy" className="relative max-h-full max-w-full object-contain transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                  ) : (
                    <FruitGlyph seed={f.slug} type={f.type} className="relative w-full transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                  )}
                </div>
                <h3 className="t-display text-[clamp(1rem,1.3vw,1.25rem)] leading-tight transition-colors group-hover:text-red">{f.name}</h3>
                {f.english && <p className="mt-1 text-[13px] text-ink-soft">{f.english}</p>}
                <p className="t-kicker mt-auto truncate border-t border-ink/25 pt-3 text-[9px]">{f.users.length ? f.users.join(' · ') : 'User unknown'}</p>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ol>
      {!shown.length && (
        <p className="t-ital py-20 text-center text-2xl text-ink-soft">No fruit by that name — perhaps it’s still growing somewhere.</p>
      )}
    </div>
  );
}
