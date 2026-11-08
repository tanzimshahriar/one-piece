'use client';

import { useMemo, useState } from 'react';
import type { Technique } from '@/lib/data/library';

export function TechniqueList({ techniques }: { techniques: Technique[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [limit, setLimit] = useState(24);
  const types = ['Standard', 'Special', 'Other'];

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return techniques.filter((t) => (!type || t.type === type) && (!query || [t.name, t.english, t.description].some((v) => v?.toLowerCase().includes(query))));
  }, [techniques, q, type]);

  return (
    <div>
      <div className="grid grid-cols-12 items-end gap-6">
        <div className="relative col-span-12 md:col-span-7">
          <label htmlFor="tech-q" className="sr-only">
            Search techniques
          </label>
          <input id="tech-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gomu Gomu no…" className="field pr-24" autoComplete="off" />
          <span className="t-kicker absolute bottom-4 right-0 text-[10px] text-ink-soft">{shown.length} moves</span>
        </div>
        <div className="col-span-12 flex flex-wrap gap-2 md:col-span-5 md:justify-end">
          <button type="button" className="chip" aria-pressed={!type} onClick={() => setType('')}>
            All
          </button>
          {types.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={type === t} onClick={() => setType(type === t ? '' : t)}>
              {t} <span className="count">{techniques.filter((x) => x.type === t).length}</span>
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-8 grid grid-cols-1 gap-x-10 md:grid-cols-2">
        {shown.slice(0, limit).map((t, i) => (
          <li key={t.id} className="group grid grid-cols-12 gap-3 border-t border-ink/25 py-4">
            <span className="t-kicker num col-span-2 pt-1 text-[10px] text-ink-soft">{String(i + 1).padStart(3, '0')}</span>
            <div className="col-span-10">
              <p className="t-display text-lg leading-tight transition-colors group-hover:text-red">{t.name}</p>
              <p className="t-kicker mt-1 text-[9px] text-ink-soft">
                {t.english} · {t.type}
              </p>
              {t.description && <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{t.description}</p>}
            </div>
          </li>
        ))}
      </ol>
      {shown.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + 30)} className="btn-line mt-8">
          Show {Math.min(30, shown.length - limit)} more
        </button>
      )}
    </div>
  );
}
