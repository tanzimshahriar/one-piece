'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useApp } from './Providers';

type Hit = { kind: string; title: string; sub?: string; href: string; image?: string };

const SUGGESTIONS: Hit[] = [
  { kind: 'Character', title: 'Monkey D. Luffy', href: '/characters/monkey-d-luffy' },
  { kind: 'Devil Fruit', title: 'Gomu Gomu no Mi', href: '/devil-fruits/gomu-gomu-no-mi' },
  { kind: 'Faction', title: 'Straw Hat Pirates', href: '/crews/straw-hat-pirates' },
  { kind: 'Island', title: 'Wano Country', href: '/world/wano-country' },
  { kind: 'Ship', title: 'Thousand Sunny', href: '/ships/thousand-sunny' },
  { kind: 'Arc', title: 'Enies Lobby Arc', href: '/voyage/25-enies-lobby' },
];

const KIND_JP: Record<string, string> = {
  Character: '人物',
  'Devil Fruit': '悪魔の実',
  Island: '島',
  Ship: '船',
  Faction: '勢力',
  Arc: '編',
};

export function SearchPalette() {
  const { searchOpen, setSearchOpen } = useApp();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQ('');
      setHits([]);
      setActive(0);
      setError(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setHits([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const json = (await res.json()) as { results?: Hit[]; error?: string };
        setHits(json.results ?? []);
        setError(json.error ?? null);
        setActive(0);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError('The Den Den Mushi lost signal. Try again.');
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q]);

  const list = q.trim() ? hits : SUGGESTIONS;

  const go = (hit: Hit) => {
    setSearchOpen(false);
    router.push(hit.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSearchOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && list[active]) {
      e.preventDefault();
      go(list[active]);
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-start justify-center bg-ink/60 px-3 pt-[10vh] backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search the almanac"
        >
          <motion.div
            className="relative w-full max-w-[760px] border-[3px] border-ink bg-paper shadow-[10px_10px_0_var(--ink)]"
            initial={{ y: -30, rotate: -1.5, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKey}
          >
            <div className="flex items-center justify-between border-b-[3px] border-ink bg-ink px-5 py-2.5 text-paper">
              <span className="t-kicker text-[10px]">電伝虫 · Den Den Mushi relay</span>
              <span className="t-kicker text-[10px] opacity-60">{loading ? 'Purupurupuru…' : 'Esc to hang up'}</span>
            </div>
            <div className="px-5 pt-4">
              <label htmlFor="palette-q" className="sr-only">
                Search characters, fruits, islands, ships, factions and arcs
              </label>
              <input
                ref={inputRef}
                id="palette-q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Who are you looking for?"
                className="field"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={list[active] ? `hit-${active}` : undefined}
              />
            </div>
            <p className="t-kicker px-5 pt-3 text-[10px] text-ink-soft">
              {q.trim() ? (error ? error : `${hits.length} result${hits.length === 1 ? '' : 's'}`) : 'Popular bearings'}
            </p>
            <ul id="palette-results" role="listbox" className="max-h-[52vh] overflow-y-auto px-2 pb-3 pt-2" data-lenis-prevent>
              {list.map((hit, i) => (
                <li key={`${hit.href}-${i}`} id={`hit-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit)}
                    className={`flex w-full items-center gap-4 px-3 py-2.5 text-left transition-colors ${i === active ? 'bg-ink text-paper' : ''}`}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden border-2 border-current bg-paper-2">
                      {hit.image ? (
                        <img src={hit.image} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                      ) : (
                        <span className="t-display grid h-full w-full place-items-center text-lg text-ink">{hit.title.charAt(0)}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="t-display block truncate text-lg leading-tight">{hit.title}</span>
                      {hit.sub && <span className="block truncate text-sm opacity-70">{hit.sub}</span>}
                    </span>
                    <span className="t-kicker shrink-0 text-[10px] opacity-70">
                      {hit.kind} <span className="opacity-60">{KIND_JP[hit.kind]}</span>
                    </span>
                  </button>
                </li>
              ))}
              {q.trim() && !loading && !hits.length && !error && (
                <li className="px-3 py-8 text-center">
                  <p className="t-display text-2xl">Lost at sea.</p>
                  <p className="t-ital mt-1 text-lg text-ink-soft">Nothing on the charts for “{q.trim()}”.</p>
                </li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
