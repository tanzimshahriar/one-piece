import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WaveBand } from '@/components/art/Glyphs';
import { FactGrid, PrevNext, RecordHero, WikiProse } from '@/components/ui/Record';
import { getCrews } from '@/lib/data/crews';
import { getShips } from '@/lib/data/world';
import { wikiIntro } from '@/lib/sources/wiki';
import { baseAffiliation, nameKey } from '@/lib/util';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    return (await getShips()).ships.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const ship = (await getShips()).ships.find((s) => s.slug === params.slug);
  if (!ship) notFound();
  return { title: ship.name, description: `${ship.name}${ship.affiliation ? `, ship of the ${ship.affiliation}` : ''}.`, openGraph: ship.image ? { images: [{ url: ship.image }] } : undefined };
}

export default async function ShipPage({ params }: { params: { slug: string } }) {
  const [{ ships }, crews] = await Promise.all([getShips(), getCrews()]);
  const index = ships.findIndex((s) => s.slug === params.slug);
  if (index < 0) notFound();
  const ship = ships[index];
  const intro = await wikiIntro(ship.name, 3);
  const crew = ship.affiliation ? crews.find((c) => nameKey(c.name) === nameKey(baseAffiliation(ship.affiliation!))) : undefined;

  return (
    <article>
      <RecordHero
        crumbs={[{ href: '/ships', label: 'Shipyard' }]}
        kicker={`${ship.status === 'Destroyed' ? 'Sunk · 沈没' : ship.status === 'Active' ? 'Afloat · 航行中' : 'Fate unknown · 不明'}`}
        title={ship.name}
        alt={[ship.jp, ship.romaji]}
        mediaKind="portrait"
        seed={ship.slug}
        dek={ship.description}
        media={
          ship.image ? (
            <div className="panel aspect-square">
              <img src={ship.image} alt={ship.name} className={`absolute inset-0 h-full w-full object-cover ${ship.status === 'Destroyed' ? 'grayscale' : ''}`} fetchPriority="high" />
              <WaveBand className="absolute -bottom-1 left-0 h-16 w-full" fill="var(--sea-deep)" line="var(--paper)" seed={ship.slug} />
            </div>
          ) : undefined
        }
        badge={
          ship.status === 'Destroyed' ? (
            <span className="stamp text-[18px]">
              <span style={{ fontSize: '1.6em' }}>沈没</span>
              <span className="t-kicker" style={{ fontSize: '0.6em' }}>
                Sunk
              </span>
            </span>
          ) : undefined
        }
        facts={
          <FactGrid
            cols={2}
            items={[
              { label: 'Status', value: ship.status },
              {
                label: 'Flies the flag of',
                value: crew ? (
                  <Link href={`/crews/${crew.slug}`} className="link-ink">
                    {ship.affiliation}
                  </Link>
                ) : (
                  ship.affiliation
                ),
              },
              { label: 'Class', value: ship.type },
              { label: 'Captain', value: ship.captain },
              { label: 'Length', value: ship.length },
              { label: 'Height', value: ship.height },
              {
                label: 'First appearance',
                value: ship.firstAppearance.chapter ? `Chapter ${ship.firstAppearance.chapter}${ship.firstAppearance.episode ? ` · Episode ${ship.firstAppearance.episode}` : ''}` : ship.firstAppearance.raw,
              },
            ]}
          />
        }
      />

      <section className="page-x border-t-[3px] border-ink pt-14">
        <WikiProse intro={intro} fallback={ship.description} title="Ship’s log · 航海日誌" />
      </section>

      <PrevNext
        label="ship"
        prev={ships[index - 1] ? { href: `/ships/${ships[index - 1].slug}`, title: ships[index - 1].name } : undefined}
        next={ships[index + 1] ? { href: `/ships/${ships[index + 1].slug}`, title: ships[index + 1].name } : undefined}
      />
    </article>
  );
}
