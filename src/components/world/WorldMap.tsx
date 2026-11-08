'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { MapPoint } from '@/lib/data/world';
import { Arrow } from '../art/Glyphs';
import { ChartBase, ChartDefs } from './ChartBase';

const REGIONS = ['East Blue', 'West Blue', 'North Blue', 'South Blue', 'Paradise', 'New World', 'Sky', 'Calm Belt', 'Red Line'];

function smoothPath(points: Array<[number, number]>) {
  if (points.length < 2) return '';
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function WorldMap({ points, route }: { points: MapPoint[]; route: Array<[number, number]> }) {
  const [hover, setHover] = useState<MapPoint | null>(null);
  const [selected, setSelected] = useState<MapPoint | null>(() => points.find((p) => p.name === 'Wano Country') ?? points.find((p) => p.kind === 'island') ?? null);
  const [region, setRegion] = useState<string>('');
  const [showPlaces, setShowPlaces] = useState(true);
  const d = useMemo(() => smoothPath(route), [route]);
  const jaya = points.find((p) => p.name === 'Jaya');
  const counts = useMemo(() => Object.fromEntries(REGIONS.map((r) => [r, points.filter((p) => p.region === r && p.kind === 'island').length])), [points]);

  const visible = points.filter((p) => showPlaces || p.kind === 'island');
  const active = hover ?? null;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 flex flex-wrap items-center gap-2">
        <span className="t-kicker mr-1 text-[10px] text-ink-soft">Seas</span>
        <button type="button" className="chip" aria-pressed={!region} onClick={() => setRegion('')}>
          All
        </button>
        {REGIONS.filter((r) => counts[r]).map((r) => (
          <button key={r} type="button" className="chip" aria-pressed={region === r} onClick={() => setRegion(region === r ? '' : r)}>
            {r} <span className="count">{counts[r]}</span>
          </button>
        ))}
        <label className="t-kicker ml-auto flex cursor-pointer items-center gap-2 text-[10px]">
          <input type="checkbox" checked={showPlaces} onChange={(e) => setShowPlaces(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
          Minor ports
        </label>
      </div>

      <div className="relative col-span-12 lg:col-span-9">
        <div className="no-scrollbar -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:px-0" data-lenis-prevent>
          <div className="relative min-w-[980px]">
            <svg viewBox="0 0 1600 1000" className="block w-full bg-paper" role="img" aria-label="Chart of the One Piece world with islands plotted by sea">
              <ChartDefs />
              <ChartBase dim={region} />

              {jaya && (
                <path d={`M${jaya.x} ${jaya.y} C${jaya.x} 320 760 240 800 186`} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="2 6" opacity={region && region !== 'Sky' ? 0.2 : 0.7} />
              )}

              <mask id="route-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000">
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="16"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.4, ease: [0.7, 0, 0.2, 1] }}
                />
              </mask>
              <path
                d={d}
                fill="none"
                stroke="var(--red)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 10"
                className="dash-march"
                mask="url(#route-reveal)"
                opacity={region && !['Paradise', 'New World', 'Red Line'].includes(region) ? 0.25 : 1}
                style={{ transition: 'opacity .4s' }}
              />

              {visible.map((p) => {
                const dimmed = region && p.region !== region;
                const isSel = selected?.key === p.key;
                const isHover = hover?.key === p.key;
                const r = p.kind === 'place' ? 3.2 : p.route !== undefined ? 9 : 7;
                const showLabel = p.kind === 'island' && (p.route !== undefined || region === p.region || isSel || isHover);
                return (
                  <g
                    key={p.key}
                    transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                    opacity={dimmed ? 0.18 : 1}
                    style={{ cursor: p.slug ? 'pointer' : 'default', transition: 'opacity .4s' }}
                    onPointerEnter={() => setHover(p)}
                    onPointerLeave={() => setHover(null)}
                    onClick={() => p.kind === 'island' && setSelected(p)}
                    tabIndex={p.kind === 'island' ? 0 : -1}
                    role={p.kind === 'island' ? 'button' : undefined}
                    aria-label={p.kind === 'island' ? `${p.name}, ${p.region}` : undefined}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && p.kind === 'island' && setSelected(p)}
                  >
                    <circle r={r + 10} fill="transparent" />
                    {(isSel || isHover) && p.kind === 'island' && <circle r={r + 7} fill="none" stroke="var(--red)" strokeWidth="2" strokeDasharray="3 3" className="spin-slow" />}
                    <circle
                      r={r}
                      fill={isSel ? 'var(--red)' : p.kind === 'place' ? 'var(--ink)' : 'var(--paper)'}
                      stroke="var(--ink)"
                      strokeWidth={p.kind === 'place' ? 0 : 2.6}
                      style={{ transition: 'fill .25s' }}
                    />
                    {p.route !== undefined && (
                      <text y="3.6" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" fill={isSel ? 'var(--paper)' : 'var(--ink)'} style={{ pointerEvents: 'none' }}>
                        {p.route + 1}
                      </text>
                    )}
                    {showLabel && (
                      <text
                        x={r + 6}
                        y={p.route !== undefined && p.route % 2 ? 18 : -10}
                        fontFamily="var(--font-mono)"
                        fontSize="12"
                        fontWeight="600"
                        letterSpacing="0.5"
                        fill="var(--ink)"
                        stroke="var(--paper)"
                        strokeWidth="4"
                        paintOrder="stroke"
                        style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                      >
                        {p.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            <AnimatePresence>
              {active && (
                <motion.div
                  key={active.key}
                  className="pointer-events-none absolute z-10 w-[220px] -translate-x-1/2 border-[3px] border-ink bg-paper shadow-[6px_6px_0_var(--ink)]"
                  style={{ left: `${(active.x / 1600) * 100}%`, top: `calc(${(active.y / 1000) * 100}% + 18px)` }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {active.image && <img src={active.image} alt="" className="aspect-video w-full object-cover" />}
                  <div className="p-3">
                    <p className="t-kicker text-[9px] text-red">{active.region}</p>
                    <p className="t-display mt-1 text-base leading-tight">{active.name}</p>
                    {active.chapter && <p className="t-kicker mt-1 text-[9px] text-ink-soft">First seen · Ch. {active.chapter}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="t-kicker mt-3 text-[10px] text-ink-soft lg:hidden">← Drag the chart sideways →</p>
      </div>

      <aside className="col-span-12 lg:col-span-3">
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.key}
              className="panel lg:sticky lg:top-[calc(var(--header-h)+16px)]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {selected.image && <img src={selected.image} alt="" className="aspect-[4/3] w-full border-b-[3px] border-ink object-cover" />}
              <div className="p-5">
                <p className="t-kicker text-[10px] text-red">
                  {selected.region}
                  {selected.route !== undefined && ` · Stop ${selected.route + 1} of the voyage`}
                </p>
                <h3 className="t-display mt-2 text-3xl leading-none">{selected.name}</h3>
                {selected.chapter && <p className="t-kicker mt-3 text-[10px] text-ink-soft">First appearance · Chapter {selected.chapter}</p>}
                {selected.slug && (
                  <Link href={`/world/${selected.slug}`} className="btn-ink mt-6 w-full justify-between" data-cursor="Land">
                    Make landfall <Arrow />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-6 space-y-2 text-[13px] text-ink-soft">
          <p className="flex items-center gap-3">
            <svg width="38" height="8" aria-hidden>
              <line x1="0" y1="4" x2="38" y2="4" stroke="var(--red)" strokeWidth="3" strokeDasharray="7 5" />
            </svg>
            The Straw Hats’ route
          </p>
          <p className="flex items-center gap-3">
            <svg width="38" height="14" aria-hidden>
              <circle cx="7" cy="7" r="5.5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
            </svg>
            Island on record
          </p>
          <p className="flex items-center gap-3">
            <svg width="38" height="14" aria-hidden>
              <circle cx="7" cy="7" r="3" fill="var(--ink)" />
            </svg>
            Minor port or landmark
          </p>
        </div>
      </aside>
    </div>
  );
}
