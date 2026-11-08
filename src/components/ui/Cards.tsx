import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { CharacterCardData } from '@/lib/data/characters';
import { compactBerries, fmt, rng } from '@/lib/util';
import { Berry, statusMeta } from '../art/Glyphs';

/** Ink placeholder for records without artwork: vertical katakana on screentone. */
export function InkPlate({ name, jp, className, tone = 'ink' }: { name: string; jp?: string; className?: string; tone?: 'ink' | 'paper' }) {
  const dark = tone === 'ink';
  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${dark ? 'bg-ink text-paper' : 'bg-paper-2 text-ink'} ${className ?? ''}`}>
      <div className="tone-dots tone-fade-t absolute inset-0 opacity-40" style={{ ['--tone' as string]: dark ? 'var(--paper)' : 'var(--ink)', ['--tone-size' as string]: '6px' }} />
      <div className={`absolute inset-0 ${dark ? 'art-speed-paper' : 'art-speed-wide'} opacity-[0.12]`} />
      {jp ? (
        <span className="tategaki t-display relative max-h-[86%] overflow-hidden text-[clamp(1.3rem,3vw,2.4rem)] leading-none">{jp.replace(/[・·]/g, '')}</span>
      ) : (
        <span className="t-display relative text-[clamp(3rem,8vw,6rem)] leading-none outline-paper">{name.charAt(0)}</span>
      )}
    </div>
  );
}

export function CharacterCard({
  c,
  index,
  feature = false,
  className,
  sizes,
}: {
  c: CharacterCardData;
  index?: number;
  feature?: boolean;
  className?: string;
  sizes?: string;
}) {
  const meta = statusMeta[c.status];
  return (
    <Link href={`/characters/${c.slug}`} className={`group block ${className ?? ''}`} data-cursor="Dossier" aria-label={`${c.name}${c.epithet ? `, ${c.epithet}` : ''}`}>
      <div className={`panel relative ${feature ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
        {c.image ? (
          <>
            <img
              src={c.image}
              alt=""
              loading="lazy"
              decoding="async"
              sizes={sizes}
              className="duotone absolute inset-0 h-full w-full object-cover object-[50%_12%] group-hover:scale-[1.04]"
            />
            <div className="tone-dots pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" style={{ ['--tone-size' as string]: '5px' }} />
          </>
        ) : (
          <InkPlate name={c.name} jp={c.jp} />
        )}
        <div className="speedlines art-speed-ink mask-ring pointer-events-none absolute inset-0" />
        <div className="absolute left-0 top-0 flex items-stretch">
          <span className="t-display bg-paper px-1.5 py-1 text-[13px] leading-none" style={{ color: meta.color }} title={meta.label}>
            {meta.jp.charAt(0)}
          </span>
          {typeof index === 'number' && <span className="t-kicker bg-ink px-1.5 py-1 text-[9px] leading-none text-paper">{String(index).padStart(3, '0')}</span>}
        </div>
        {c.strawHat && (
          <span className="t-kicker absolute right-0 top-0 bg-red px-2 py-1 text-[9px] text-paper">{c.strawHat.role}</span>
        )}
        {feature && c.epithet && (
          <span className="t-ital absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/85 to-transparent px-4 pb-3 pt-10 text-xl leading-tight text-paper">{c.epithet}</span>
        )}
      </div>
      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`t-display leading-[1.02] ${feature ? 'text-[clamp(1.4rem,2.4vw,2.2rem)]' : 'text-[clamp(1rem,1.25vw,1.2rem)]'} transition-colors group-hover:text-red`}>{c.name}</h3>
          {c.tagline && <p className="mt-1 truncate text-[13px] text-ink-soft">{c.tagline}</p>}
        </div>
        {c.bounty ? (
          <span className="t-serif num mt-0.5 flex shrink-0 items-center gap-0.5 text-[15px] font-black" title={`${fmt(c.bounty)} berries`}>
            <Berry className="text-red" />
            {compactBerries(c.bounty)}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function WantedPoster({
  name,
  image,
  amount,
  status,
  href,
  className,
  style,
  rank,
  priority = false,
}: {
  name: string;
  image?: string;
  amount: number;
  status?: 'Alive' | 'Deceased' | 'Unknown';
  href?: string;
  className?: string;
  style?: CSSProperties;
  rank?: number;
  priority?: boolean;
}) {
  const body = (
    <article className={`wanted ${className ?? ''}`} style={style} aria-label={`Wanted: ${name}, ${fmt(amount)} berries`}>
      <p className="wanted__title" aria-hidden>
        WANTED
      </p>
      <div className="wanted__photo">
        {image ? (
          <img src={image} alt="" loading={priority ? 'eager' : 'lazy'} decoding="async" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="t-display text-[22cqi] text-[#2a1a0c]/40">?</span>
          </div>
        )}
        {status === 'Deceased' && (
          <span
            className="t-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 whitespace-nowrap border-[3px] border-red px-2 py-1 text-[9cqi] leading-none text-red mix-blend-multiply"
            style={{ filter: 'url(#ink-rough)' }}
          >
            DECEASED
          </span>
        )}
      </div>
      <p className="wanted__doa">DEAD OR ALIVE</p>
      <p className="wanted__name">{name}</p>
      <p className="wanted__amount">
        <Berry style={{ height: '0.85em' }} />
        <span>{fmt(amount)}-</span>
      </p>
      <div className="wanted__fine">
        <span>{rank ? `No. ${String(rank).padStart(3, '0')}` : 'Grand Line'}</span>
        <span className="wanted__marine">MARINE</span>
      </div>
    </article>
  );
  return href ? (
    <Link href={href} className="block transition-transform duration-500 ease-out hover:-translate-y-1" data-cursor="Dossier">
      {body}
    </Link>
  ) : (
    body
  );
}

export function seededTilt(seed: string, max = 3) {
  const r = rng(seed);
  return (r() - 0.5) * 2 * max;
}

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const window: Array<number | '…'> = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) window.push(p);
    else if (window[window.length - 1] !== '…') window.push('…');
  }
  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`chip ${page === 1 ? 'pointer-events-none opacity-30' : ''}`}
        scroll={false}
      >
        ← Prev
      </Link>
      {window.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="t-kicker px-1 text-ink-soft">
            …
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} aria-current={p === page ? 'page' : undefined} className="chip num min-w-[44px] justify-center" scroll={false}>
            {String(p).padStart(2, '0')}
          </Link>
        ),
      )}
      <Link
        href={hrefFor(Math.min(pages, page + 1))}
        aria-disabled={page === pages}
        className={`chip ${page === pages ? 'pointer-events-none opacity-30' : ''}`}
        scroll={false}
      >
        Next →
      </Link>
    </nav>
  );
}

export function Marquee({ children, speed = 40, reverse = false, className }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  return (
    <div className={`marquee overflow-hidden ${className ?? ''}`}>
      <div className={`marquee-track ${reverse ? 'is-rev' : ''}`} style={{ ['--marquee-speed' as string]: `${speed}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Log-scaled step chart of a bounty's rise. */
export function BountyChart({ history, className }: { history: number[]; className?: string }) {
  if (history.length < 2) return null;
  const W = 560;
  const H = 180;
  const pad = { l: 8, r: 8, t: 26, b: 22 };
  const logs = history.map((v) => Math.log10(v));
  const min = Math.min(...logs) - 0.15;
  const max = Math.max(...logs) + 0.05;
  const x = (i: number) => pad.l + (i / (history.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (Math.log10(v) - min) / (max - min)) * (H - pad.t - pad.b);
  let d = `M${x(0)} ${y(history[0])}`;
  for (let i = 1; i < history.length; i++) d += ` H${x(i)} V${y(history[i])}`;
  const area = `${d} V${H - pad.b} H${x(0)} Z`;
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label={`Bounty history: ${history.map((h) => fmt(h)).join(', ')} berries`}>
        <defs>
          <pattern id="bc-tone" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle cx="3" cy="3" r="1.1" fill="var(--ink)" />
          </pattern>
        </defs>
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--ink)" strokeWidth="2" />
        <path d={area} fill="url(#bc-tone)" opacity="0.35" />
        <path d={d} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="miter" />
        {history.map((v, i) => {
          const last = i === history.length - 1;
          return (
            <g key={i}>
              <circle cx={x(i)} cy={y(v)} r={last ? 7 : 4.5} fill={last ? 'var(--red)' : 'var(--paper)'} stroke="var(--ink)" strokeWidth="2.5" />
              <text
                x={x(i)}
                y={y(v) - 12}
                textAnchor={i === 0 ? 'start' : last ? 'end' : 'middle'}
                fontFamily="var(--font-mono)"
                fontSize="12"
                fontWeight="700"
                fill={last ? 'var(--red)' : 'var(--ink)'}
              >
                {compactBerries(v)}
              </text>
              <text x={x(i)} y={H - 4} textAnchor={i === 0 ? 'start' : last ? 'end' : 'middle'} fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-soft)">
                {String(i + 1).padStart(2, '0')}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/** Small label/value row used in record fact sheets. */
export function Fact({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border-t border-ink/25 py-3 ${className ?? ''}`}>
      <dt className="t-kicker text-[10px] text-ink-soft">{label}</dt>
      <dd className="mt-1 text-[17px] font-medium leading-snug">{children}</dd>
    </div>
  );
}
