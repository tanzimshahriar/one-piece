import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CharacterCard } from '@/components/ui/Cards';
import { FactGrid, PrevNext, RecordHero, WikiProse } from '@/components/ui/Record';
import { ChartBase, ChartDefs } from '@/components/world/ChartBase';
import { SEA_INFO } from '@/lib/curated';
import { getCharacters, toCard, withPortraits } from '@/lib/data/characters';
import { getIslands, getWorldMap } from '@/lib/data/world';
import { wikiIntro } from '@/lib/sources/wiki';
import { nameKey } from '@/lib/util';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    return (await getIslands()).slice(0, 30).map((i) => ({ slug: i.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const island = (await getIslands()).find((i) => i.slug === params.slug);
  if (!island) notFound();
  return { title: island.name, description: `${island.name} — ${island.sea ?? 'an island'} in the world of One Piece.`, openGraph: island.image ? { images: [{ url: island.image }] } : undefined };
}

export default async function IslandPage({ params }: { params: { slug: string } }) {
  const [islands, map, characters] = await Promise.all([getIslands(), getWorldMap(), getCharacters()]);
  const index = islands.findIndex((i) => i.slug === params.slug);
  if (index < 0) notFound();
  const island = islands[index];
  const point = map.points.find((p) => p.key === island.id);
  const intro = await wikiIntro(island.name, 3);

  const key = nameKey(island.name.replace(/\b(Kingdom|Island|Islands|Country|Archipelago)\b/gi, ''));
  const natives = key.length > 2 ? characters.filter((c) => c.origin && nameKey(c.origin).includes(key)).slice(0, 12) : [];
  const nativeCards = await withPortraits(natives);

  return (
    <article>
      <RecordHero
        crumbs={[{ href: '/world', label: 'World Chart' }]}
        kicker={`${island.region ?? island.sea ?? 'Island'} · 島`}
        title={island.name}
        alt={[island.jp, island.romaji]}
        seed={island.slug}
        media={
          island.image ? (
            <div className="panel aspect-[21/9]">
              <img src={island.image} alt={`${island.name}`} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
              <span className="t-kicker absolute left-0 top-0 bg-ink px-2 py-1 text-[10px] text-paper">Landfall · {island.name}</span>
            </div>
          ) : undefined
        }
        facts={
          <FactGrid
            items={[
              { label: 'Sea', value: island.sea },
              { label: 'Region', value: island.region ? `${island.region} · ${SEA_INFO[island.region].jp}` : undefined },
              { label: 'Climate / type', value: island.type },
              { label: 'Population', value: island.population },
              { label: 'Affiliation', value: island.affiliation },
              {
                label: 'First appearance',
                value: island.firstAppearance.chapter
                  ? `Chapter ${island.firstAppearance.chapter}${island.firstAppearance.episode ? ` · Episode ${island.firstAppearance.episode}` : ''}`
                  : island.firstAppearance.raw,
              },
            ]}
          />
        }
      />

      <section className="page-x grid grid-cols-12 gap-x-10 gap-y-12 border-t-[3px] border-ink pt-14">
        <div className="col-span-12 lg:col-span-7">
          <WikiProse intro={intro} fallback={island.region ? SEA_INFO[island.region].blurb : undefined} />
        </div>
        {point && (
          <aside className="col-span-12 lg:col-span-5">
            <p className="t-kicker mb-3 text-[10px] text-ink-soft">Position on the chart</p>
            <div className="panel">
              <svg viewBox={`${Math.max(0, Math.min(1000, point.x - 300))} ${Math.max(0, Math.min(625, point.y - 187))} 600 375`} className="block w-full" role="img" aria-label={`${island.name} on the world chart`}>
                <ChartDefs />
                <ChartBase />
                <circle cx={point.x} cy={point.y} r="26" fill="none" stroke="var(--red)" strokeWidth="3" strokeDasharray="5 5" className="spin-slow" style={{ transformOrigin: `${point.x}px ${point.y}px` }} />
                <circle cx={point.x} cy={point.y} r="10" fill="var(--red)" stroke="var(--ink)" strokeWidth="3" />
                <text x={point.x + 36} y={point.y + 6} fontFamily="var(--font-display)" fontSize="22" fill="var(--ink)" stroke="var(--paper)" strokeWidth="5" paintOrder="stroke">
                  {island.name}
                </text>
              </svg>
            </div>
          </aside>
        )}
      </section>

      {nativeCards.length > 0 && (
        <section className="page-x mt-20">
          <h2 className="t-display border-b-[3px] border-ink pb-4 text-[clamp(1.8rem,4vw,3.4rem)] uppercase leading-none">Born here</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {nativeCards.map((c) => (
              <li key={c.id}>
                <CharacterCard c={toCard(c)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <PrevNext
        label="island"
        prev={islands[index - 1] ? { href: `/world/${islands[index - 1].slug}`, title: islands[index - 1].name } : undefined}
        next={islands[index + 1] ? { href: `/world/${islands[index + 1].slug}`, title: islands[index + 1].name } : undefined}
      />
    </article>
  );
}
