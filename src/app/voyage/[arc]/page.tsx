import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SpeedLines } from '@/components/art/Glyphs';
import { Reveal } from '@/components/ui/Motion';
import { FactGrid, PrevNext, RecordHero, WikiProse } from '@/components/ui/Record';
import { ARCS } from '@/lib/curated';
import { getArc, getVoyage } from '@/lib/data/voyage';
import { wikiIntro } from '@/lib/sources/wiki';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    return (await getVoyage()).flatMap((s) => s.arcs).map((a) => ({ arc: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { arc: string } }): Promise<Metadata> {
  const sagas = await getVoyage();
  const arc = sagas.flatMap((s) => s.arcs).find((a) => a.slug === params.arc);
  if (!arc) notFound();
  return { title: `${arc.name} Arc`, description: `The ${arc.name} Arc of One Piece${arc.episodes ? ` — episodes ${arc.episodes.from} to ${arc.episodes.to}` : ''}.` };
}

function airDate(d?: string) {
  if (!d) return undefined;
  const date = new Date(`${d}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default async function ArcPage({ params }: { params: { arc: string } }) {
  const data = await getArc(params.arc);
  if (!data) notFound();
  const { arc, saga, episodes, prev, next } = data;
  const intro = await wikiIntro(ARCS[arc.id]?.wiki ?? `${arc.name} Arc`, 3);

  return (
    <article>
      <RecordHero
        crumbs={[
          { href: '/voyage', label: 'The Voyage' },
          { href: `/voyage#saga-${saga.id}`, label: `${saga.name} Saga` },
        ]}
        kicker={`Arc ${String(arc.id).padStart(2, '0')} · ${arc.filler ? 'Filler' : arc.special ? 'Cover story' : 'Canon'}`}
        title={`${arc.name}`}
        alt={[saga.jp, `${saga.name} Saga`]}
        seed={arc.slug}
        media={
          arc.image ? (
            <div className="panel relative aspect-[21/9]">
              <img src={arc.image} alt={`${arc.name} Arc artwork`} className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" fetchPriority="high" />
              <SpeedLines seed={arc.slug} inner={0.75} className="pointer-events-none absolute inset-0 h-full w-full text-ink opacity-40" />
            </div>
          ) : undefined
        }
        facts={
          <FactGrid
            items={[
              { label: 'Saga', value: `${saga.name} (${saga.id}/10)` },
              { label: 'Episodes', value: arc.episodes ? `${arc.episodes.from}–${arc.episodes.to}` : undefined },
              { label: 'Episode count', value: episodes.length || arc.episodes?.count },
              { label: 'Type', value: arc.filler ? 'Anime original (filler)' : arc.special ? 'Cover-page serial' : 'Manga canon' },
            ]}
          />
        }
      />

      <section className="page-x grid grid-cols-12 gap-x-10 gap-y-10 border-t-[3px] border-ink pt-14">
        <div className="col-span-12 lg:col-span-7">
          <WikiProse intro={intro} fallback={arc.description} title="Synopsis · あらすじ" />
        </div>
        {arc.description && intro && (
          <aside className="col-span-12 lg:col-span-5">
            <div className="panel bg-ink p-6 text-paper">
              <p className="t-kicker text-[10px] text-straw">From the logbook</p>
              <p className="mt-3 text-[15px] leading-relaxed text-paper/85">{arc.description}</p>
            </div>
          </aside>
        )}
      </section>

      {episodes.length > 0 && (
        <section className="page-x mt-20">
          <div className="flex items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
            <h2 className="t-display text-[clamp(1.8rem,4vw,3.4rem)] uppercase leading-none">Episode guide</h2>
            <span className="t-kicker text-[11px] text-ink-soft">放送リスト · {episodes.length} episodes</span>
          </div>
          <ol className="divide-y divide-ink/20">
            {episodes.map((e, i) => (
              <Reveal as="li" key={`${e.number}-${i}`} y={16}>
                <details className="group/ep py-5">
                  <summary className="grid cursor-pointer list-none grid-cols-12 items-center gap-4 [&::-webkit-details-marker]:hidden">
                    <span className="t-display num col-span-2 text-[clamp(1.4rem,2.6vw,2.4rem)] leading-none text-ink-soft transition-colors group-open/ep:text-red sm:col-span-1">
                      {e.number}
                    </span>
                    <span className="col-span-10 hidden sm:col-span-2 sm:block">
                      <span className="block aspect-video overflow-hidden border-2 border-ink bg-paper-2">
                        {e.image && <img src={e.image} alt="" loading="lazy" className="h-full w-full object-cover grayscale transition group-open/ep:grayscale-0" />}
                      </span>
                    </span>
                    <span className="col-span-10 sm:col-span-7">
                      <span className="t-display block text-[clamp(1rem,1.5vw,1.3rem)] leading-tight">{e.title}</span>
                      <span className="t-kicker mt-1 block text-[9px] text-ink-soft">
                        {airDate(e.airDate)}
                        {e.chapters ? ` · Ch. ${e.chapters}` : ''}
                      </span>
                    </span>
                    <span className="t-kicker col-span-12 text-right text-[10px] sm:col-span-2">
                      <span className="group-open/ep:hidden">Synopsis +</span>
                      <span className="hidden group-open/ep:inline">Close −</span>
                    </span>
                  </summary>
                  {e.description && (
                    <div className="grid grid-cols-12 gap-4 pt-4">
                      <p className="col-span-12 max-w-[72ch] whitespace-pre-line text-[15px] leading-relaxed text-ink-2 sm:col-span-9 sm:col-start-4">{e.description}</p>
                    </div>
                  )}
                </details>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      <PrevNext
        label="arc"
        prev={prev ? { href: `/voyage/${prev.slug}`, title: prev.name } : undefined}
        next={next ? { href: `/voyage/${next.slug}`, title: next.name } : undefined}
      />
    </article>
  );
}
