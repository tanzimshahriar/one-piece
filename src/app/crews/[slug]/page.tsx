import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Arrow, Berry, SpeedLines } from '@/components/art/Glyphs';
import { CharacterCard } from '@/components/ui/Cards';
import { FactGrid, RecordHero, WikiProse } from '@/components/ui/Record';
import { toCard, withPortraits } from '@/lib/data/characters';
import { CATEGORY_META, getCrew, getCrews } from '@/lib/data/crews';
import { getShips } from '@/lib/data/world';
import { wikiIntro } from '@/lib/sources/wiki';
import { baseAffiliation, fmt, nameKey } from '@/lib/util';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    return (await getCrews()).slice(0, 30).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCrew(params.slug);
  if (!data) notFound();
  return { title: data.crew.name, description: `${data.crew.name}: ${data.crew.memberCount} members on record${data.crew.totalBounty ? `, ฿${fmt(data.crew.totalBounty)} in combined bounties` : ''}.` };
}

export default async function CrewPage({ params }: { params: { slug: string } }) {
  const data = await getCrew(params.slug);
  if (!data) notFound();
  const { crew, related } = data;
  const [members, former, { ships }, intro] = await Promise.all([withPortraits(data.members), withPortraits(data.former.slice(0, 18)), getShips(), wikiIntro(crew.name, 3)]);
  const fleet = ships.filter((s) => s.affiliation && nameKey(baseAffiliation(s.affiliation)) === nameKey(crew.name));
  const meta = CATEGORY_META[crew.category];
  const captain = members.find((m) => m.occupations.some((o) => /captain|leader|commander-in-chief|fleet admiral|king|queen|head/i.test(o)));

  return (
    <article>
      <RecordHero
        crumbs={[{ href: '/crews', label: 'Factions' }]}
        kicker={`${meta.label} · ${meta.jp}`}
        title={crew.name}
        alt={[crew.roman, crew.yonko ? 'Crew of an Emperor of the Sea' : undefined]}
        mediaKind="portrait"
        seed={crew.slug}
        media={
          <div className="panel relative grid aspect-square place-items-center bg-paper">
            <SpeedLines seed={crew.slug} inner={0.55} className="absolute inset-0 h-full w-full text-ink opacity-20" />
            {crew.emblem ?? crew.topImage ? (
              <img src={crew.emblem ?? crew.topImage ?? ""} alt={`Emblem of the ${crew.name}`} className="relative max-h-[80%] max-w-[80%] object-contain" />
            ) : (
              <span className="t-display relative text-[10rem] text-ink/15">{crew.name.charAt(0)}</span>
            )}
            {crew.yonko && <span className="t-kicker absolute left-0 top-0 bg-red px-2 py-1 text-[10px] text-paper">四皇 · Emperor</span>}
          </div>
        }
        facts={
          <FactGrid
            cols={2}
            items={[
              { label: 'Members on record', value: crew.memberCount },
              { label: 'Currently serving', value: members.length },
              {
                label: 'Combined bounty',
                value: crew.totalBounty ? (
                  <span className="t-serif num flex items-center gap-1 text-xl font-black">
                    <Berry className="text-red" />
                    {fmt(crew.totalBounty)}
                  </span>
                ) : undefined,
              },
              { label: 'Leader', value: captain ? <Link href={`/characters/${captain.slug}`} className="link-ink">{captain.name}</Link> : undefined },
              { label: 'Ships', value: fleet.length ? fleet.map((s) => s.name).join(', ') : undefined },
              { label: 'Romanised', value: crew.roman },
            ]}
          />
        }
      />

      <section className="page-x border-t-[3px] border-ink pt-14">
        <WikiProse intro={intro} fallback={`${crew.name} — ${crew.memberCount} names in the archive.`} />
      </section>

      {members.length > 0 && (
        <section className="page-x mt-20">
          <div className="flex items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
            <h2 className="t-display text-[clamp(1.8rem,4vw,3.4rem)] uppercase leading-none">The roster</h2>
            <Link href={`/characters?crew=${encodeURIComponent(crew.name)}`} className="t-kicker flex items-center gap-2 text-[11px]">
              Filter the cast <Arrow />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {members.map((m, i) => (
              <li key={m.id}>
                <CharacterCard c={toCard(m)} index={i + 1} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {former.length > 0 && (
        <section className="page-x mt-20">
          <h2 className="t-display border-b-[3px] border-ink pb-4 text-[clamp(1.5rem,3vw,2.6rem)] uppercase leading-none text-ink-soft">Former members & allies</h2>
          <ul className="mt-8 grid grid-cols-3 gap-4 opacity-80 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {former.map((m) => (
              <li key={m.id}>
                <CharacterCard c={toCard(m)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {fleet.length > 0 && (
        <section className="page-x mt-20">
          <h2 className="t-display border-b-[3px] border-ink pb-4 text-[clamp(1.5rem,3vw,2.6rem)] uppercase leading-none">Fleet</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {fleet.map((s) => (
              <li key={s.id}>
                <Link href={`/ships/${s.slug}`} className="group block" data-cursor="Board">
                  <div className="panel aspect-[5/4]">{s.image && <img src={s.image} alt="" loading="lazy" className="duotone absolute inset-0 h-full w-full object-cover" />}</div>
                  <p className="t-display mt-2 text-lg group-hover:text-red">{s.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="page-x mt-20">
          <p className="t-kicker mb-4 text-[10px] text-ink-soft">More {meta.label.toLowerCase()}</p>
          <ul className="flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/crews/${r.slug}`} className="chip">
                  {r.name} <span className="count">{r.memberCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
