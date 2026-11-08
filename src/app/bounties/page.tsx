import type { Metadata } from 'next';
import Link from 'next/link';
import { Berry, SpeedLines } from '@/components/art/Glyphs';
import { WantedPoster, seededTilt } from '@/components/ui/Cards';
import { Reveal, Sfx } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { getWanted } from '@/lib/data/bounties';
import { withPortraits } from '@/lib/data/characters';
import { compactBerries, fmt } from '@/lib/util';

export const metadata: Metadata = {
  title: 'Most Wanted',
  description: 'Every active bounty in One Piece, ranked — from Whitebeard’s 5 billion berries down to the smallest-time crooks.',
};
export const revalidate = 43200;

type Search = { view?: string; status?: string };

export default async function BountiesPage({ searchParams }: { searchParams: Search }) {
  const all = await withPortraits(await getWanted(), 600);
  const view = searchParams.view === 'ledger' ? 'ledger' : 'wall';
  const list = all.filter((w) => !searchParams.status || w.status === searchParams.status);
  const total = all.reduce((s, w) => s + w.amount, 0);
  const max = all[0]?.amount ?? 1;
  const minLog = Math.log10(Math.min(...all.map((w) => w.amount)));
  const podium = view === 'wall' && !searchParams.status ? list.slice(0, 3) : [];
  const rest = podium.length ? list.slice(3) : list;

  const qs = (patch: Partial<Search>) => {
    const p = new URLSearchParams(Object.entries({ ...searchParams, ...patch }).filter(([, v]) => v) as Array<[string, string]>);
    if (p.get('view') === 'wall') p.delete('view');
    const s = p.toString();
    return s ? `/bounties?${s}` : '/bounties';
  };

  return (
    <>
      <PageHero
        no="02"
        kicker="Most Wanted"
        title="Most Wanted"
        jp="手配書"
        seed="wanted"
        dek="The Marines’ own ledger of the dangerous and the defiant. A bounty is not a measure of strength — it is a measure of how much the World Government fears you."
        stats={[
          { label: 'Posters', value: all.length },
          { label: 'Billion ฿ total', value: Math.round(total / 1e9) },
          { label: 'Over a billion', value: all.filter((w) => w.amount >= 1e9).length },
        ]}
      />

      <section className="page-x pt-10">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-2" role="group" aria-label="View">
            <span className="t-kicker mr-1 text-[10px] text-ink-soft">View</span>
            <Link href={qs({ view: 'wall' })} className="chip" aria-current={view === 'wall' ? 'page' : undefined} scroll={false}>
              Poster wall
            </Link>
            <Link href={qs({ view: 'ledger' })} className="chip" aria-current={view === 'ledger' ? 'page' : undefined} scroll={false}>
              Ledger
            </Link>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Status">
            <span className="t-kicker mr-1 text-[10px] text-ink-soft">Status</span>
            {['Alive', 'Deceased', 'Unknown'].map((s) => (
              <Link
                key={s}
                href={qs({ status: searchParams.status === s ? undefined : s })}
                className="chip"
                aria-current={searchParams.status === s ? 'page' : undefined}
                scroll={false}
              >
                {s} <span className="count">{all.filter((w) => w.status === s).length}</span>
              </Link>
            ))}
          </div>
          <p className="t-kicker ml-auto text-[10px] text-ink-soft">
            Total on the board · <span className="text-ink">฿{fmt(total)}</span>
          </p>
        </div>
      </section>

      {view === 'wall' ? (
        <section className="relative mt-10 overflow-hidden bg-ink py-16 text-paper md:py-24">
          <SpeedLines seed="board" inner={0.35} className="pointer-events-none absolute inset-0 h-full w-full text-paper opacity-[0.05]" />
          {podium.length > 0 && (
            <div className="page-x relative mb-20 grid grid-cols-1 items-end gap-10 sm:grid-cols-3 md:gap-14">
              {[podium[1], podium[0], podium[2]].map((w, i) =>
                w ? (
                  <Reveal key={w.characterId} delay={i * 0.12} className={`relative mx-auto w-full ${i === 1 ? 'max-w-[400px] sm:-mt-10' : 'max-w-[330px]'}`}>
                    <span className="t-display absolute -top-10 left-1/2 z-10 -translate-x-1/2 text-5xl text-red">{String(w.rank).padStart(2, '0')}</span>
                    <span className="absolute -top-3 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-ink bg-red" aria-hidden />
                    <div style={{ transform: `rotate(${seededTilt(w.name, 3)}deg)` }}>
                      <WantedPoster name={w.name} image={w.image} amount={w.amount} status={w.status} href={w.href} rank={w.rank} priority />
                    </div>
                  </Reveal>
                ) : null,
              )}
              <Sfx text="ザワ…" className="absolute -top-6 right-[4%] hidden text-[clamp(2.5rem,5vw,5rem)] md:block" rotate={10} />
            </div>
          )}
          <ol className="page-x relative grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {rest.map((w) => (
              <li key={w.characterId} className="relative">
                <span className="absolute -top-2 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink bg-straw" aria-hidden />
                <div style={{ transform: `rotate(${seededTilt(w.name, 3.5)}deg)` }}>
                  <WantedPoster name={w.name} image={w.image} amount={w.amount} status={w.status} href={w.href} rank={w.rank} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="page-x mt-10">
          <ol className="border-t-[3px] border-ink">
            {list.map((w) => {
              const pct = ((Math.log10(w.amount) - minLog + 0.15) / (Math.log10(max) - minLog + 0.15)) * 100;
              return (
                <li key={w.characterId} className="border-b border-ink/25">
                  <Link href={w.href} className="group grid grid-cols-12 items-center gap-3 py-3 md:gap-5" data-cursor="Dossier">
                    <span className="t-display num col-span-2 text-xl text-ink-soft group-hover:text-red sm:col-span-1">{String(w.rank).padStart(3, '0')}</span>
                    <span className="col-span-2 sm:col-span-1">
                      <span className="block aspect-square w-full max-w-[56px] overflow-hidden border-2 border-ink bg-paper-2">
                        {w.image && <img src={w.image} alt="" loading="lazy" className="h-full w-full object-cover object-top grayscale transition group-hover:grayscale-0" />}
                      </span>
                    </span>
                    <span className="col-span-8 min-w-0 sm:col-span-4">
                      <span className="t-display block truncate text-lg leading-tight transition-colors group-hover:text-red md:text-xl">{w.name}</span>
                      <span className="block truncate text-[13px] text-ink-soft">{w.epithet ?? w.affiliation ?? w.status}</span>
                    </span>
                    <span className="col-span-8 col-start-3 sm:col-span-4 sm:col-start-auto">
                      <span className="block h-3 w-full bg-paper-2">
                        <span className={`block h-full ${w.status === 'Deceased' ? 'tone-hatch' : 'bg-ink'}`} style={{ width: `${pct}%` }} />
                      </span>
                    </span>
                    <span className="t-serif num col-span-4 flex items-center justify-end gap-1 text-right text-lg font-black sm:col-span-2">
                      <Berry className="text-red" />
                      <span className="hidden xl:inline">{fmt(w.amount)}</span>
                      <span className="xl:hidden">{compactBerries(w.amount)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="t-kicker mt-4 text-[10px] text-ink-soft">Bars on a logarithmic scale · hatched = deceased</p>
        </section>
      )}
    </>
  );
}
