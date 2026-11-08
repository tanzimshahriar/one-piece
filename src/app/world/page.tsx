import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from '@/components/art/Glyphs';
import { Reveal } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { WorldMap } from '@/components/world/WorldMap';
import { SEA_INFO, type SeaRegion } from '@/lib/curated';
import { getIslands, getWorldMap } from '@/lib/data/world';

export const metadata: Metadata = {
  title: 'World Chart',
  description: 'An interactive chart of the One Piece world: the four Blues, Paradise, the New World, the sky islands and the Straw Hats’ route.',
};
export const revalidate = 43200;

const ORDER: SeaRegion[] = ['East Blue', 'Paradise', 'Sky', 'Calm Belt', 'Red Line', 'New World', 'North Blue', 'West Blue', 'South Blue'];

export default async function WorldPage() {
  const [islands, map] = await Promise.all([getIslands(), getWorldMap()]);
  const groups = ORDER.map((r) => ({ region: r, list: islands.filter((i) => i.region === r) })).filter((g) => g.list.length);

  return (
    <>
      <PageHero
        no="04"
        kicker="World Chart"
        title="World Chart"
        jp="世界地図"
        seed="world"
        dek="A world cut in four by a continent and a current. Here is every island on record, and the red thread of one crew’s voyage across them."
        stats={[
          { label: 'Islands', value: islands.length },
          { label: 'Minor ports', value: map.points.filter((p) => p.kind === 'place').length },
          { label: 'Route stops', value: map.route.length },
        ]}
        art={<Compass className="spin-slow w-44 text-ink opacity-80" />}
      />

      <section className="page-x mt-10">
        <WorldMap points={map.points} route={map.route} />
      </section>

      <section className="page-x mt-28">
        <div className="flex items-end justify-between border-b-[3px] border-ink pb-4">
          <h2 className="t-display text-[clamp(2rem,5.5vw,4.6rem)] uppercase leading-none">Gazetteer</h2>
          <span className="t-kicker text-[11px] text-ink-soft">地名辞典 · by sea</span>
        </div>
        <div className="mt-4 space-y-20">
          {groups.map((g) => (
            <div key={g.region} id={g.region.toLowerCase().replace(/\s+/g, '-')} className="grid grid-cols-12 gap-6 pt-8">
              <div className="col-span-12 md:col-span-3">
                <div className="md:sticky md:top-[calc(var(--header-h)+16px)]">
                  <p className="t-display text-3xl text-red">{SEA_INFO[g.region].jp}</p>
                  <h3 className="t-display mt-2 text-[clamp(1.8rem,3vw,2.8rem)] leading-none">{g.region}</h3>
                  <p className="t-ital mt-3 text-lg leading-snug text-ink-soft">{SEA_INFO[g.region].blurb}</p>
                  <p className="t-kicker mt-4 text-[10px]">{g.list.length} islands</p>
                </div>
              </div>
              <ul className="col-span-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:col-span-9 lg:grid-cols-4">
                {g.list.map((i, k) => (
                  <Reveal as="li" key={i.id} delay={(k % 4) * 0.05}>
                    <Link href={`/world/${i.slug}`} className="group block" data-cursor="Land">
                      <div className="panel aspect-[4/3]">
                        {i.image ? (
                          <img src={i.image} alt="" loading="lazy" className="duotone absolute inset-0 h-full w-full object-cover group-hover:scale-105" />
                        ) : (
                          <div className="tone-dots absolute inset-0 opacity-30" />
                        )}
                        <div className="tone-dots pointer-events-none absolute inset-0 opacity-15 mix-blend-multiply transition-opacity group-hover:opacity-0" />
                      </div>
                      <p className="t-display mt-2 text-lg leading-tight transition-colors group-hover:text-red">{i.name}</p>
                      <p className="t-kicker mt-1 text-[9px] text-ink-soft">
                        {i.jp ?? i.sea}
                        {i.firstAppearance.chapter ? ` · Ch. ${i.firstAppearance.chapter}` : ''}
                      </p>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
