import Link from 'next/link';
import type { ReactNode } from 'react';
import type { WikiIntro } from '@/lib/sources/wiki';
import { SpeedLines } from '../art/Glyphs';
import { Reveal, SplitText } from './Motion';

type Crumb = { href: string; label: string };

/** Opening spread for every non-character record page. */
export function RecordHero({
  crumbs,
  kicker,
  title,
  alt = [],
  media,
  mediaKind = 'landscape',
  facts,
  badge,
  dek,
  seed,
}: {
  crumbs: Crumb[];
  kicker: string;
  title: string;
  alt?: Array<string | undefined>;
  media?: ReactNode;
  mediaKind?: 'landscape' | 'portrait' | 'object';
  facts?: ReactNode;
  badge?: ReactNode;
  dek?: ReactNode;
  seed?: string;
}) {
  const landscape = mediaKind === 'landscape';
  return (
    <header className="page-x relative overflow-hidden pb-14 pt-[calc(var(--header-h)+4vh)]">
      <SpeedLines seed={seed ?? title} inner={0.6} className="pointer-events-none absolute -right-[25%] -top-[20%] h-[120%] w-[90%] text-ink opacity-[0.06]" />
      <Reveal y={10}>
        <p className="t-kicker relative flex flex-wrap items-center gap-3 text-[11px]">
          {crumbs.map((c) => (
            <span key={c.href} className="flex items-center gap-3">
              <Link href={c.href} className="link-ink">
                {c.label}
              </Link>
              <span className="text-ink-soft">/</span>
            </span>
          ))}
          <span className="text-red">{kicker}</span>
        </p>
      </Reveal>

      <div className={`relative mt-8 grid grid-cols-12 gap-x-6 gap-y-10 md:gap-x-10 ${landscape ? '' : 'items-start'}`}>
        <div className={landscape ? 'col-span-12' : 'col-span-12 md:col-span-7 md:order-2'}>
          <SplitText
            as="h1"
            text={title}
            immediate
            delay={0.1}
            className={`t-display block uppercase leading-[0.86] ${
              title.length > 26
                ? 'text-[clamp(2rem,4.4vw,4.6rem)]'
                : title.length > 15
                  ? landscape
                    ? 'text-[clamp(2.4rem,6vw,6.4rem)]'
                    : 'text-[clamp(2.2rem,5vw,5.2rem)]'
                  : 'text-[clamp(2.6rem,7.5vw,7.8rem)]'
            }`}
          />
          {alt.filter(Boolean).length > 0 && (
            <Reveal delay={0.25}>
              <p className="t-kicker mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink-soft">
                {alt.filter(Boolean).map((a, i) => (
                  <span key={i} className={i === 0 ? 'normal-case tracking-[0.12em] text-ink' : ''}>
                    {a}
                  </span>
                ))}
              </p>
            </Reveal>
          )}
          {dek && (
            <Reveal delay={0.3}>
              <div className="t-ital mt-6 max-w-[42ch] text-[clamp(1.2rem,1.9vw,1.7rem)] leading-snug text-ink-2">{dek}</div>
            </Reveal>
          )}
          {!landscape && facts && (
            <Reveal delay={0.35} className="mt-8">
              {facts}
            </Reveal>
          )}
        </div>

        {media && (
          <Reveal delay={0.15} className={landscape ? 'col-span-12' : 'relative col-span-12 md:col-span-5 md:order-1'}>
            <div className="relative">
              {media}
              {badge && <div className="absolute -bottom-5 -right-2 md:-right-5">{badge}</div>}
            </div>
          </Reveal>
        )}

        {landscape && facts && (
          <Reveal delay={0.3} className="col-span-12">
            {facts}
          </Reveal>
        )}
      </div>
    </header>
  );
}

export function WikiProse({ intro, fallback, title = 'The record · 記録' }: { intro: WikiIntro | null; fallback?: ReactNode; title?: string }) {
  return (
    <div>
      <p className="t-kicker text-[11px] text-red">{title}</p>
      {intro ? (
        <>
          <div className="prose-ink dropcap mt-6 max-w-[64ch]">
            {intro.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="t-kicker mt-8 text-[10px] text-ink-soft">
            Source:{' '}
            <a href={intro.url} target="_blank" rel="noreferrer" className="link-ink text-ink">
              One Piece Wiki
            </a>{' '}
            · CC BY-SA 3.0 ·{' '}
            <a href={intro.url} target="_blank" rel="noreferrer" className="link-ink text-ink">
              Full article ↗
            </a>
          </p>
        </>
      ) : (
        <div className="t-ital mt-6 max-w-[52ch] text-2xl leading-snug text-ink-soft">{fallback ?? 'The logbooks are silent on this one.'}</div>
      )}
    </div>
  );
}

export function PrevNext({ prev, next, label = 'record' }: { prev?: { href: string; title: string }; next?: { href: string; title: string }; label?: string }) {
  return (
    <nav className="page-x mt-24 grid grid-cols-2 border-y-[3px] border-ink" aria-label={`Adjacent ${label}s`}>
      {prev ? (
        <Link href={prev.href} className="group border-r-[3px] border-ink py-8 pr-4" data-cursor="Prev">
          <span className="t-kicker text-[10px] text-ink-soft">← Previous {label}</span>
          <span className="t-display mt-2 block text-[clamp(1.2rem,3vw,2.6rem)] leading-none transition-colors group-hover:text-red">{prev.title}</span>
        </Link>
      ) : (
        <span className="border-r-[3px] border-ink" />
      )}
      {next ? (
        <Link href={next.href} className="group py-8 pl-4 text-right" data-cursor="Next">
          <span className="t-kicker text-[10px] text-ink-soft">Next {label} →</span>
          <span className="t-display mt-2 block text-[clamp(1.2rem,3vw,2.6rem)] leading-none transition-colors group-hover:text-red">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function FactGrid({ items, cols = 4 }: { items: Array<{ label: string; value?: ReactNode }>; cols?: 2 | 3 | 4 }) {
  const shown = items.filter((i) => i.value !== undefined && i.value !== null && i.value !== '');
  const colClass = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[cols];
  return (
    <dl className={`grid grid-cols-2 gap-x-6 border-b border-ink/25 ${colClass}`}>
      {shown.map((i) => (
        <div key={i.label} className="border-t border-ink/25 py-3">
          <dt className="t-kicker text-[10px] text-ink-soft">{i.label}</dt>
          <dd className="mt-1 text-[17px] font-medium leading-snug">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
