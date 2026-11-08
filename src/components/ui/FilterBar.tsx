'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

export type FilterGroup = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
  kind?: 'chips' | 'select';
};

/**
 * URL-driven filters. Every change is reflected in the query string so
 * results are server-rendered, shareable and back-button friendly.
 */
export function FilterBar({
  groups,
  searchPlaceholder,
  sort,
  total,
  noun = 'records',
}: {
  groups: FilterGroup[];
  searchPlaceholder?: string;
  sort?: Array<{ value: string; label: string }>;
  total: number;
  noun?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get('q') ?? '');
  const first = useRef(true);

  const push = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete('page');
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => {
      push((p) => (q.trim() ? p.set('q', q.trim()) : p.delete('q')));
    }, 320);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = groups.some((g) => params.get(g.key)) || params.get('q');

  return (
    <div className="space-y-6" aria-busy={pending}>
      {searchPlaceholder && (
        <div className="relative">
          <label htmlFor="filter-q" className="sr-only">
            {searchPlaceholder}
          </label>
          <input id="filter-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="field pr-28" autoComplete="off" />
          <span className="t-kicker absolute bottom-4 right-0 text-[10px] text-ink-soft">
            {pending ? 'Searching…' : `${total.toLocaleString('en-US')} ${noun}`}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {groups.map((g) =>
          g.kind === 'select' ? (
            <label key={g.key} className="flex items-center gap-3">
              <span className="t-kicker text-[10px] text-ink-soft">{g.label}</span>
              <select className="select-ink max-w-[220px]" value={params.get(g.key) ?? ''} onChange={(e) => push((p) => (e.target.value ? p.set(g.key, e.target.value) : p.delete(g.key)))}>
                <option value="">All</option>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                    {o.count !== undefined ? ` (${o.count})` : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div key={g.key} className="flex flex-wrap items-center gap-2" role="group" aria-label={g.label}>
              <span className="t-kicker mr-1 text-[10px] text-ink-soft">{g.label}</span>
              {g.options.map((o) => {
                const on = params.get(g.key) === o.value;
                return (
                  <button key={o.value} type="button" className="chip" aria-pressed={on} onClick={() => push((p) => (on ? p.delete(g.key) : p.set(g.key, o.value)))}>
                    {o.label}
                    {o.count !== undefined && <span className="count">{o.count}</span>}
                  </button>
                );
              })}
            </div>
          ),
        )}
        {sort && (
          <label className="ml-auto flex items-center gap-3">
            <span className="t-kicker text-[10px] text-ink-soft">Sort</span>
            <select className="select-ink" value={params.get('sort') ?? sort[0].value} onChange={(e) => push((p) => (e.target.value === sort[0].value ? p.delete('sort') : p.set('sort', e.target.value)))}>
              {sort.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {active && (
          <button
            type="button"
            className="t-kicker text-[10px] text-red underline underline-offset-4"
            onClick={() => {
              setQ('');
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
