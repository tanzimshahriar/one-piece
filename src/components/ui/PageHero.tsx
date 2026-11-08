import type { ReactNode } from 'react';
import { SpeedLines } from '../art/Glyphs';
import { Counter, Reveal, SplitText } from './Motion';

type Stat = { label: string; value: number; suffix?: string };

/**
 * Shared opening spread for section pages: chapter number, colossal title,
 * vertical Japanese caption, italic dek and running stats.
 */
export function PageHero({
  no,
  kicker,
  title,
  jp,
  dek,
  stats = [],
  art,
  seed,
  children,
}: {
  no: string;
  kicker: string;
  title: string;
  jp: string;
  dek: ReactNode;
  stats?: Stat[];
  art?: ReactNode;
  seed?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-x relative overflow-hidden pb-10 pt-[calc(var(--header-h)+6vh)] md:pb-14">
      <SpeedLines
        seed={seed ?? title}
        inner={0.58}
        className="pointer-events-none absolute -right-[20%] -top-[30%] h-[140%] w-[90%] text-ink opacity-[0.07]"
      />
      <div className="relative flex items-center justify-between gap-4">
        <Reveal y={10} className="t-kicker flex items-center gap-3 text-[11px]">
          <span className="bg-ink px-2 py-1 text-paper">§{no}</span>
          <span>{kicker}</span>
        </Reveal>
        <Reveal y={10} delay={0.1} className="t-kicker hidden text-[11px] text-ink-soft sm:block">
          Grand Line Almanac · Vol. {no}
        </Reveal>
      </div>

      <div className="relative mt-8 grid grid-cols-12 items-end gap-6">
        <div className="col-span-12 lg:col-span-10">
          <SplitText as="h1" text={title} immediate delay={0.15} className="t-display block text-[clamp(3.4rem,12.5vw,13.5rem)] uppercase" />
        </div>
        <div className="absolute right-0 top-0 hidden lg:block" aria-hidden>
          <span className="tategaki t-display block text-[clamp(2.4rem,4.2vw,4.6rem)] leading-none text-red">{jp}</span>
        </div>
        {art && <div className="pointer-events-none absolute -top-10 right-[8%] hidden md:block">{art}</div>}
      </div>

      <div className="relative mt-8 grid grid-cols-12 gap-x-6 gap-y-8 md:mt-12">
        <Reveal delay={0.35} className="col-span-12 md:col-span-6 lg:col-span-5">
          <p className="t-ital text-[clamp(1.3rem,2vw,1.85rem)] leading-[1.25] text-ink-2">{dek}</p>
          <p className="t-kicker mt-4 text-[10px] text-ink-soft lg:hidden">{jp}</p>
        </Reveal>
        {stats.length > 0 && (
          <Reveal delay={0.45} className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-7">
            <dl className="grid grid-cols-3 border-t-[3px] border-ink">
              {stats.map((s, i) => (
                <div key={s.label} className={`pt-3 ${i > 0 ? 'border-l border-ink/25 pl-4' : ''}`}>
                  <dt className="t-kicker text-[10px] text-ink-soft">{s.label}</dt>
                  <dd className="t-display mt-2 text-[clamp(1.6rem,3.2vw,2.8rem)] leading-none">
                    <Counter value={s.value} />
                    {s.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
      {children}
      <div className="rule-double relative mt-10 md:mt-14" />
    </header>
  );
}

export function SectionHead({ no, title, jp, children, className }: { no?: string; title: string; jp?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 border-b-[3px] border-ink pb-4 md:flex-row md:items-end md:justify-between ${className ?? ''}`}>
      <div>
        {no && <p className="t-kicker mb-3 text-[10px] text-red">{no}</p>}
        <h2 className="t-display text-[clamp(2rem,5.5vw,4.6rem)] uppercase">
          {title}
          {jp && <span className="t-kicker ml-4 align-middle text-[11px] tracking-[0.2em] text-ink-soft">{jp}</span>}
        </h2>
      </div>
      {children}
    </div>
  );
}
