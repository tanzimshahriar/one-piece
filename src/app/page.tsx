import Link from 'next/link';
import { Arrow, Berry, SpeedLines, Star, WaveBand } from '@/components/art/Glyphs';
import { FruitGlyph } from '@/components/art/FruitGlyph';
import { ContentsList } from '@/components/home/ContentsList';
import { HomeHero } from '@/components/home/HomeHero';
import { WantedRail } from '@/components/home/WantedRail';
import { InkPlate, Marquee } from '@/components/ui/Cards';
import { Counter, Reveal, Sfx, SplitText } from '@/components/ui/Motion';
import { FRUIT_TYPES, SECTIONS, SECTION_ART, STRAW_HATS } from '@/lib/curated';
import { getWanted } from '@/lib/data/bounties';
import { getCharacters, withPortraits } from '@/lib/data/characters';
import { getFruits } from '@/lib/data/fruits';
import { getStats } from '@/lib/data/search';
import { getVoyage } from '@/lib/data/voyage';
import { compactBerries, fmt } from '@/lib/util';

export const revalidate = 43200;

/** Explicit manga-page placement for the ten Straw Hats (12 × 8 grid). */
const CREW_LAYOUT = [
  'lg:col-[1/span_5] lg:row-[1/span_5]',
  'lg:col-[6/span_4] lg:row-[1/span_3]',
  'lg:col-[10/span_3] lg:row-[1/span_3]',
  'lg:col-[6/span_3] lg:row-[4/span_2]',
  'lg:col-[9/span_4] lg:row-[4/span_2]',
  'lg:col-[1/span_2] lg:row-[6/span_3]',
  'lg:col-[3/span_3] lg:row-[6/span_3]',
  'lg:col-[6/span_3] lg:row-[6/span_3]',
  'lg:col-[9/span_2] lg:row-[6/span_3]',
  'lg:col-[11/span_2] lg:row-[6/span_3]',
];

export default async function Home() {
  const [characters, wanted, stats, fruits, sagas] = await Promise.all([getCharacters(), getWanted(), getStats(), getFruits(), getVoyage()]);

  const crew = await withPortraits(
    STRAW_HATS.map((s) => characters.find((c) => c.name === s.name)).filter((c): c is NonNullable<typeof c> => Boolean(c)),
    800,
  );
  const top = wanted.slice(0, 12);
  const fruitTypes = ['Paramecia', 'Zoan', 'Logia'] as const;
  const fruitCounts = Object.fromEntries(fruitTypes.map((t) => [t, fruits.filter((f) => f.type.includes(t === 'Zoan' ? 'Zoan' : t)).length]));
  const crewBounty = crew.reduce((s, c) => s + (c.bounty ?? 0), 0);

  const statCells = [
    { v: stats.characters, l: 'Characters', jp: '人物' },
    { v: stats.fruits, l: 'Devil Fruits', jp: '悪魔の実' },
    { v: stats.islands, l: 'Islands', jp: '島' },
    { v: stats.wanted, l: 'Bounties', jp: '懸賞金' },
    { v: stats.crews, l: 'Factions', jp: '勢力' },
    { v: stats.ships, l: 'Ships', jp: '船' },
    { v: stats.episodes, l: 'Episodes', jp: '話' },
    { v: stats.chapters, l: 'Chapters', jp: '章' },
    { v: stats.volumes, l: 'Volumes', jp: '巻' },
  ];

  const counts: Record<string, string> = {
    '/characters': fmt(stats.characters),
    '/bounties': fmt(stats.wanted),
    '/devil-fruits': fmt(stats.fruits),
    '/world': fmt(stats.islands),
    '/ships': fmt(stats.ships),
    '/crews': fmt(stats.crews),
    '/voyage': '50 arcs',
    '/library': `${stats.volumes} vols`,
    '/arsenal': '5 kinds',
  };

  return (
    <>
      <HomeHero characters={stats.characters} islands={stats.islands} episodes={stats.episodes} />

      {/* ── Crossing tapes ─────────────────────────────────────────── */}
      <div className="relative z-10 -mt-6 overflow-hidden py-10" aria-hidden>
        <div className="-rotate-[2.2deg] scale-x-105 border-y-[3px] border-ink bg-ink py-3 text-paper">
          <Marquee speed={60}>
            {top.map((w) => (
              <span key={w.characterId} className="flex items-center gap-4 pr-10">
                <span className="t-kicker text-[11px] text-straw">Wanted</span>
                <span className="t-display text-2xl">{w.name}</span>
                <span className="t-serif num flex items-center gap-1 text-2xl font-black">
                  <Berry className="text-red" />
                  {fmt(w.amount)}
                </span>
                <Star className="text-red" />
              </span>
            ))}
          </Marquee>
        </div>
        <div className="-mt-3 rotate-[1.6deg] scale-x-105 border-y-[3px] border-ink bg-red py-2.5 text-paper">
          <Marquee speed={45} reverse>
            {['World Economy News', '世界経済新聞', 'Extra! Extra!', '号外', 'A new era dawns', '新時代', 'The seas are restless', '海が騒ぐ'].map((t) => (
              <span key={t} className="t-display flex items-center gap-6 pr-6 text-xl">
                {t} <span className="text-ink">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ── Prologue ───────────────────────────────────────────────── */}
      <section className="page-x relative py-20 md:py-28">
        <div className="grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <p className="t-kicker text-[11px] text-red">Chapter 0 · Prologue · 序章</p>
            </Reveal>
            <SplitText
              as="h2"
              text={'“My treasure?\nIf you want it,\nI’ll let you have it.\nLook for it!”'}
              className="t-serif mt-6 block text-[clamp(2.2rem,4.6vw,4.4rem)] font-black italic leading-[1.02]"
            />
            <Reveal delay={0.3}>
              <p className="t-kicker mt-6 text-[11px] text-ink-soft">— Gol D. Roger, Loguetown execution platform</p>
              <p className="mt-10 max-w-md text-[17px] leading-relaxed text-ink-2">
                With those words a whole generation put to sea. This almanac keeps the records they left behind — the faces on the posters, the fruits
                they ate, the islands they burned or saved, and every chapter of the voyage so far.
              </p>
              <Link href="/voyage" className="btn-ink mt-8" data-cursor="Sail">
                Follow the voyage <Arrow />
              </Link>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-7">
            <dl className="grid grid-cols-3 gap-[10px] bg-paper">
              {statCells.map((s, i) => {
                const dark = i === 4;
                const red = i === 0;
                return (
                  <Reveal
                    key={s.l}
                    delay={i * 0.05}
                    className={`panel flex aspect-square flex-col justify-between p-3 sm:p-5 ${dark ? '!bg-ink text-paper' : ''} ${red ? '!bg-red text-paper' : ''}`}
                  >
                    {i === 2 && <div className="tone-dots tone-fade-b absolute inset-0 opacity-30" />}
                    {i === 6 && <div className="tone-hatch-fine absolute inset-0 opacity-20" />}
                    <dt className="t-kicker relative flex justify-between text-[9px] sm:text-[10px]">
                      <span>{s.l}</span>
                      <span className="opacity-60">{s.jp}</span>
                    </dt>
                    <dd className="t-display relative text-[clamp(1.35rem,3.4vw,3.5rem)] leading-none">
                      <Counter value={s.v} />
                    </dd>
                  </Reveal>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* ── The Straw Hat crew: a manga spread ──────────────────────── */}
      <section className="page-x relative pb-24" aria-labelledby="crew-title">
        <div className="flex flex-col gap-6 border-b-[3px] border-ink pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-kicker text-[11px] text-red">Featured crew · 麦わらの一味</p>
            <h2 id="crew-title" className="t-display mt-3 text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.85]">
              THE STRAW HATS
            </h2>
          </div>
          <div className="flex items-end gap-8">
            <div>
              <p className="t-kicker text-[10px] text-ink-soft">Combined bounty</p>
              <p className="t-serif num mt-1 flex items-center gap-1 text-[clamp(1.6rem,3vw,2.6rem)] font-black leading-none">
                <Berry className="text-red" />
                {fmt(crewBounty)}
              </p>
            </div>
            <Link href="/crews/straw-hat-pirates" className="btn-line hidden md:inline-flex" data-cursor="Crew">
              Full roster <Arrow />
            </Link>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-12 lg:grid-rows-[repeat(8,minmax(0,min(9vw,128px)))]">
          {crew.map((c, i) => {
            const sh = STRAW_HATS[i];
            const big = i === 0;
            return (
              <Reveal key={c.id} delay={(i % 5) * 0.06} className={`${CREW_LAYOUT[i]} ${big ? 'col-span-2 sm:col-span-3' : ''}`}>
                <Link
                  href={`/characters/${c.slug}`}
                  className={`group panel relative block h-full ${big ? 'aspect-[4/5] lg:aspect-auto' : 'aspect-[3/4] lg:aspect-auto'}`}
                  data-cursor="Dossier"
                >
                  {c.image ? (
                    <img src={c.image} alt={c.name} loading={big ? 'eager' : 'lazy'} className="duotone absolute inset-0 h-full w-full object-cover object-[50%_10%] group-hover:scale-105" />
                  ) : (
                    <InkPlate name={c.name} jp={c.jp} />
                  )}
                  <div className="tone-dots pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />
                  <div className="speedlines art-speed-ink mask-ring pointer-events-none absolute inset-0" />
                  <span className="tategaki t-display absolute right-0 top-0 bg-paper px-1 py-2 text-[clamp(14px,1.4vw,22px)] leading-none">{sh.jp}</span>
                  <div className="absolute bottom-0 left-0 max-w-[92%] border-r-[3px] border-t-[3px] border-ink bg-paper px-3 py-2">
                    <p className="t-kicker text-[9px] text-red">{sh.role}</p>
                    <p className={`t-display leading-none ${big ? 'mt-1 text-[clamp(1.6rem,3vw,3rem)]' : 'mt-0.5 text-[clamp(0.95rem,1.3vw,1.25rem)]'}`}>{c.name}</p>
                    {c.bounty && (
                      <p className="t-serif num mt-1 flex items-center gap-0.5 text-[13px] font-black">
                        <Berry className="text-red" />
                        {big ? fmt(c.bounty) : compactBerries(c.bounty)}
                      </p>
                    )}
                  </div>
                  {big && <p className="t-ital absolute left-4 top-4 max-w-[60%] bg-ink px-3 py-1.5 text-lg leading-tight text-paper">“{sh.dream}.”</p>}
                </Link>
              </Reveal>
            );
          })}
          <Sfx text="ゴゴゴ" className="absolute -right-2 top-[30%] z-10 hidden text-[clamp(2.5rem,5vw,5rem)] lg:block" rotate={8} />
        </div>
      </section>

      {/* ── Most wanted rail ───────────────────────────────────────── */}
      <WantedRail wanted={top} />

      {/* ── Devil fruits ───────────────────────────────────────────── */}
      <section className="page-x relative overflow-hidden py-24 md:py-32">
        <div className="grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 md:col-span-7">
            <p className="t-kicker text-[11px] text-red">§03 · 悪魔の実</p>
            <SplitText as="h2" text={'Eat one.\nLose the sea.'} className="t-display mt-4 block text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.85]" />
          </div>
          <Reveal className="col-span-12 md:col-span-5" delay={0.2}>
            <p className="t-ital text-[clamp(1.2rem,1.8vw,1.6rem)] leading-snug text-ink-2">
              {stats.fruits} fruits on record, each a curse and a crown. Swirled skin, foul taste, and a power no two people may share at once.
            </p>
          </Reveal>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-[10px] md:grid-cols-3">
          {fruitTypes.map((t, i) => (
            <Reveal key={t} delay={i * 0.1}>
              <Link href={`/devil-fruits?type=${encodeURIComponent(t)}`} className="group panel flex h-full flex-col p-6" data-cursor="Taste">
                <div className="tone-dots tone-fade-t absolute inset-x-0 top-0 h-1/2 opacity-15" />
                <div className="flex items-start justify-between">
                  <span className="t-kicker text-[10px] text-ink-soft">Type {String(i + 1).padStart(2, '0')}</span>
                  <span className="t-display text-xl text-red">{FRUIT_TYPES[t].jp}</span>
                </div>
                <FruitGlyph seed={`home-${t}`} type={t} className="bob mx-auto my-6 w-[min(56%,220px)] transition-transform duration-700 group-hover:scale-110" />
                <h3 className="t-display text-[clamp(2rem,3.4vw,3rem)] leading-none">{t}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{FRUIT_TYPES[t].blurb}</p>
                <p className="t-kicker mt-6 flex items-center justify-between border-t-2 border-ink pt-3 text-[11px]">
                  <span>
                    <Counter value={fruitCounts[t]} /> on record
                  </span>
                  <Arrow />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Voyage strip ───────────────────────────────────────────── */}
      <section className="relative bg-sea-deep py-24 text-paper md:py-32">
        <WaveBand className="absolute -top-px left-0 h-10 w-full rotate-180 md:h-14" fill="var(--paper)" line="var(--sea-deep)" seed="voyage-top" />
        <div className="page-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="t-kicker text-[11px] text-straw">§07 · 航海日誌 · The log</p>
              <h2 className="t-display mt-4 text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.85]">TEN SAGAS</h2>
            </div>
            <Link href="/voyage" className="btn-line border-paper text-paper hover:!bg-paper hover:!text-ink" data-cursor="Sail">
              Read the log <Arrow />
            </Link>
          </div>
          <ol className="no-scrollbar -mx-[var(--gutter)] mt-12 flex snap-x gap-[10px] overflow-x-auto px-[var(--gutter)] pb-4">
            {sagas.map((s) => (
              <li key={s.id} className="w-[260px] shrink-0 snap-start">
                <Link href={`/voyage#saga-${s.id}`} className="group relative flex h-[340px] flex-col overflow-hidden border-[3px] border-paper p-5" data-cursor="Open">
                  {s.arcs.find((a) => a.image) && (
                    <img
                      src={s.arcs.find((a) => a.image && !a.filler)?.image ?? s.arcs.find((a) => a.image)!.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-60 group-hover:grayscale-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-sea-deep via-sea-deep/60 to-transparent" />
                  <span className="t-display outline-paper relative text-[88px] leading-none">{String(s.id).padStart(2, '0')}</span>
                  <span className="relative mt-auto">
                    <span className="t-kicker block text-[10px] text-straw">{s.jp}</span>
                    <span className="t-display mt-2 block text-3xl leading-none">{s.name}</span>
                    <span className="t-kicker mt-3 block text-[10px] text-paper/60">
                      {s.arcs.length} arcs · Ch. {s.chapters}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Contents ───────────────────────────────────────────────── */}
      <section className="page-x relative py-24 md:py-32">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="t-kicker text-[11px] text-red">Index · 目次</p>
            <h2 className="t-display mt-4 text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.85]">CONTENTS</h2>
          </div>
          <p className="t-ital hidden max-w-xs text-right text-xl text-ink-soft md:block">Nine chapters. One very large ocean.</p>
        </div>
        <ContentsList items={SECTIONS.map((s) => ({ ...s, image: SECTION_ART[s.href], count: counts[s.href] }))} />
      </section>

      {/* ── Closing panel ──────────────────────────────────────────── */}
      <section className="page-x relative pb-10">
        <div className="panel relative overflow-hidden bg-red px-6 py-16 text-center text-paper md:py-24">
          <SpeedLines seed="closing" inner={0.4} className="pointer-events-none absolute inset-0 h-full w-full text-ink opacity-30" />
          <p className="t-kicker relative text-[11px]">Total bounty money on the board</p>
          <p className="t-display num relative mt-4 flex flex-wrap items-center justify-center gap-2 text-[clamp(2.2rem,8vw,7.5rem)] leading-none">
            <Berry />
            <Counter value={stats.totalBounty} duration={2.4} />
          </p>
          <Link href="/bounties" className="btn-ink relative mt-10 !border-ink" data-cursor="Hunt">
            Start hunting <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
