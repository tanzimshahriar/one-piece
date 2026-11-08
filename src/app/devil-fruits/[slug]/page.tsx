import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FruitGlyph } from '@/components/art/FruitGlyph';
import { SpeedLines } from '@/components/art/Glyphs';
import { CharacterCard } from '@/components/ui/Cards';
import { Reveal } from '@/components/ui/Motion';
import { FactGrid, PrevNext, RecordHero, WikiProse } from '@/components/ui/Record';
import { FRUIT_TYPES } from '@/lib/curated';
import { getCharacters, toCard, withPortraits } from '@/lib/data/characters';
import { getFruit, getFruits } from '@/lib/data/fruits';
import { wikiIntro } from '@/lib/sources/wiki';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    return (await getFruits()).slice(0, 30).map((f) => ({ slug: f.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getFruit(params.slug);
  if (!data) notFound();
  const f = data.fruit;
  return { title: f.name, description: `${f.name}${f.english ? ` (${f.english})` : ''} — a ${f.type} Devil Fruit. ${f.description ?? ''}`.slice(0, 200) };
}

export default async function FruitPage({ params }: { params: { slug: string } }) {
  const data = await getFruit(params.slug);
  if (!data) notFound();
  const { fruit: f, prev, next } = data;
  const [intro, characters] = await Promise.all([wikiIntro(f.name, 3).then((r) => r ?? (f.name.includes(',') ? wikiIntro(f.name.split(',')[0], 3) : null)), getCharacters()]);
  const users = await withPortraits(
    f.users.map((u) => characters.find((c) => c.slug === u.slug)).filter((c): c is NonNullable<typeof c> => Boolean(c)),
  );
  const unlinked = f.users.filter((u) => !u.slug);
  const meta = FRUIT_TYPES[f.type];

  return (
    <article>
      <RecordHero
        crumbs={[{ href: '/devil-fruits', label: 'Devil Fruits' }]}
        kicker={`${f.type} · ${meta?.jp ?? ''}`}
        title={f.name}
        alt={[f.jp, f.english, f.model ? `Model: ${f.model}` : undefined]}
        mediaKind="object"
        seed={f.slug}
        dek={f.description}
        media={
          <div className="panel relative grid aspect-square place-items-center">
            <SpeedLines seed={f.slug} inner={0.5} className="absolute inset-0 h-full w-full text-ink opacity-25" />
            <div className="tone-dots absolute inset-[18%] rounded-full opacity-20" />
            {f.image ? (
              <img src={f.image} alt={f.name} className="bob relative w-[62%] object-contain drop-shadow-[8px_10px_0_rgba(18,17,16,0.18)]" />
            ) : (
              <FruitGlyph seed={f.slug} type={f.type} className="bob relative w-[62%]" />
            )}
            <span className="t-display absolute bottom-3 left-3 bg-red px-3 py-1 text-lg text-paper">{meta?.jp}</span>
          </div>
        }
        facts={
          <FactGrid
            cols={2}
            items={[
              { label: 'Type', value: meta?.label ?? f.type },
              { label: 'Class', value: meta?.blurb },
              { label: 'Known users', value: f.users.length ? f.users.map((u) => u.name).join(', ') : 'Unknown' },
              { label: 'English name', value: f.english },
            ]}
          />
        }
      />

      <section className="page-x grid grid-cols-12 gap-x-10 gap-y-12 border-t-[3px] border-ink pt-14">
        <div className="col-span-12 lg:col-span-7">
          <WikiProse intro={intro} fallback={f.description ?? 'The encyclopedia of Devil Fruits has a blank page here.'} />
        </div>
        <aside className="col-span-12 lg:col-span-5">
          <Reveal className="panel bg-ink p-6 text-paper">
            <p className="t-kicker text-[10px] text-straw">The curse · 呪い</p>
            <p className="t-ital mt-3 text-2xl leading-snug">
              Whoever eats this fruit sinks like a hammer in the sea. Seastone drains them; a second fruit would kill them.
            </p>
          </Reveal>
        </aside>
      </section>

      {(users.length > 0 || unlinked.length > 0) && (
        <section className="page-x mt-20">
          <h2 className="t-display border-b-[3px] border-ink pb-4 text-[clamp(1.8rem,4vw,3.4rem)] uppercase leading-none">Who ate it</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {users.map((u) => (
              <li key={u.id}>
                <CharacterCard c={toCard(u)} />
              </li>
            ))}
            {unlinked.map((u) => (
              <li key={u.name} className="panel grid aspect-[3/4] place-items-center p-4 text-center">
                <span className="t-display text-xl">{u.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PrevNext
        label="fruit"
        prev={prev ? { href: `/devil-fruits/${prev.slug}`, title: prev.name } : undefined}
        next={next ? { href: `/devil-fruits/${next.slug}`, title: next.name } : undefined}
      />
    </article>
  );
}
