import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { SAGAS } from '@/lib/curated';
import { getLibrary } from '@/lib/data/library';
import { almanac } from '@/lib/sources/almanac';
import { rng } from '@/lib/util';

export const metadata: Metadata = {
  title: 'Library',
  description: 'Every tankōbon volume of One Piece on a shelf — covers, Japanese release dates and the chapters inside each one.',
};
export const revalidate = 43200;

function year(d?: string) {
  return d?.slice(0, 4);
}

export default async function LibraryPage() {
  const [volumes, chapters] = await Promise.all([getLibrary(), almanac.chapterCount()]);
  const shelves = Object.entries(SAGAS)
    .map(([id, s]) => ({ id: Number(id), ...s, volumes: volumes.filter((v) => v.sagaId === Number(id)) }))
    .filter((s) => s.volumes.length);
  const first = volumes[0];
  const last = volumes[volumes.length - 1];

  return (
    <>
      <PageHero
        no="08"
        kicker="Library"
        title="The Library"
        jp="単行本"
        seed="library"
        dek={`${volumes.length} volumes, ${typeof chapters === 'number' ? chapters.toLocaleString('en-US') : '1,100+'} chapters and nearly three decades of ink. Pull any spine from the shelf to look inside.`}
        stats={[
          { label: 'Volumes', value: volumes.length },
          { label: 'Chapters', value: typeof chapters === 'number' ? chapters : 1197 },
          { label: 'Years in print', value: Number(year(last?.jpDate) ?? 2026) - Number(year(first?.jpDate) ?? 1997) },
        ]}
      />

      <section className="page-x mt-12 grid grid-cols-1 gap-x-14 gap-y-16 lg:grid-cols-2">
        {shelves.map((shelf) => (
          <Reveal key={shelf.id}>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="t-display text-[clamp(1.4rem,2.6vw,2.2rem)] leading-none">
                <span className="t-kicker mr-3 align-middle text-[10px] text-ink-soft">Saga {String(shelf.id).padStart(2, '0')}</span>
                {shelf.name}
                <span className="ml-3 text-[0.7em] text-red">{shelf.jp}</span>
              </h2>
              <span className="t-kicker text-[10px] text-ink-soft">Vol. {shelf.volumes[0].number}–{shelf.volumes[shelf.volumes.length - 1].number}</span>
            </div>
            <div className="relative">
              <ol className="flex flex-wrap items-end gap-x-[3px] gap-y-8 px-1 pt-8">
                {shelf.volumes.map((v) => {
                  const r = rng(`vol-${v.number}`);
                  const w = 36 + Math.floor(r() * 16);
                  const h = 236 + Math.floor(r() * 44);
                  return (
                    <li key={v.number} className="group relative" style={{ width: w }}>
                      <Link
                        href={`/library/${v.number}`}
                        className="relative flex flex-col items-center overflow-hidden border-2 border-ink transition-transform duration-300 ease-out group-hover:-translate-y-4 group-focus-within:-translate-y-4"
                        style={{ height: h, background: `linear-gradient(90deg, rgba(0,0,0,.25), transparent 22%, transparent 78%, rgba(0,0,0,.3)), ${v.tone}` }}
                        aria-label={`Volume ${v.number}: ${v.title}`}
                      >
                        <span className="mt-2 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-paper text-[10px] font-bold text-ink">{v.number}</span>
                        <span
                          className="t-display mt-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] leading-none text-paper"
                          style={{ writingMode: 'vertical-rl', maxHeight: h - 70 }}
                        >
                          {v.title}
                        </span>
                        <span className="mb-1.5 h-[2px] w-[60%] bg-paper/70" />
                        <span className="t-kicker mb-2 text-[7px] tracking-normal text-paper/80">{year(v.jpDate)}</span>
                      </Link>
                      {v.cover && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-6 hidden w-[150px] -translate-x-1/2 rotate-[-3deg] border-[3px] border-ink bg-paper shadow-[8px_8px_0_var(--ink)] group-hover:block">
                          <img src={v.cover} alt="" loading="lazy" className="block aspect-[2/3] w-full object-cover" />
                          <p className="t-kicker px-2 py-1.5 text-[9px]">Vol. {v.number}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              <div className="relative mt-0 h-5 border-[3px] border-ink bg-straw-deep">
                <div className="tone-hatch-fine absolute inset-0 opacity-40" />
              </div>
              <div className="mx-6 h-3 border-x-[3px] border-b-[3px] border-ink bg-ink/80" />
            </div>
          </Reveal>
        ))}
      </section>

      <section className="page-x mt-24">
        <div className="flex items-end justify-between border-b-[3px] border-ink pb-4">
          <h2 className="t-display text-[clamp(2rem,5.5vw,4.6rem)] uppercase leading-none">Cover gallery</h2>
          <span className="t-kicker text-[11px] text-ink-soft">表紙</span>
        </div>
        <ol className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-10">
          {volumes.map((v) => (
            <li key={v.number}>
              <Link href={`/library/${v.number}`} className="group block" data-cursor="Read">
                <div className="relative aspect-[2/3] overflow-hidden border-2 border-ink bg-paper-2">
                  {v.cover && <img src={v.cover} alt={`Volume ${v.number} cover`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <span className="t-kicker absolute bottom-0 left-0 bg-ink px-1.5 py-0.5 text-[9px] text-paper">{v.number}</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
