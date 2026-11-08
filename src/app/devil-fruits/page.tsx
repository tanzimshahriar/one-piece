import type { Metadata } from 'next';
import { FruitGlyph } from '@/components/art/FruitGlyph';
import { FruitExplorer, type FruitLite } from '@/components/fruits/FruitExplorer';
import { Reveal } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { FRUIT_TYPES } from '@/lib/curated';
import { getFruits } from '@/lib/data/fruits';
import { truncate } from '@/lib/util';

export const metadata: Metadata = {
  title: 'Devil Fruits',
  description: 'Every known Devil Fruit in One Piece — Paramecia, Zoan, Logia, Mythical and Ancient Zoan, SMILEs — with their users and powers.',
};
export const revalidate = 43200;

export default async function FruitsPage({ searchParams }: { searchParams: { type?: string } }) {
  const fruits = await getFruits();
  const order = ['Paramecia', 'Zoan', 'Ancient Zoan', 'Mythical Zoan', 'Logia', 'SMILE', 'Artificial', 'Unknown'];
  const types = order
    .map((key) => ({ key, label: FRUIT_TYPES[key]?.label ?? key, jp: FRUIT_TYPES[key]?.jp ?? '', count: fruits.filter((f) => f.type === key).length }))
    .filter((t) => t.count > 0);

  const lite: FruitLite[] = fruits.map((f) => ({
    slug: f.slug,
    name: f.name,
    english: f.english,
    jp: f.jp,
    type: f.type,
    image: f.image,
    users: f.users.map((u) => u.name).slice(0, 2),
    blurb: f.description ? truncate(f.description, 110) : undefined,
  }));

  return (
    <>
      <PageHero
        no="03"
        kicker="Devil Fruits"
        title="Devil Fruits"
        jp="悪魔の実"
        seed="fruits"
        dek="Said to be the incarnations of the sea’s devils. One bite grants a power no one else alive may hold — and the ocean will never again let you float."
        stats={[
          { label: 'On record', value: fruits.length },
          { label: 'Users known', value: fruits.filter((f) => f.users.length).length },
          { label: 'Logia', value: fruits.filter((f) => f.type === 'Logia').length },
        ]}
        art={
          <div className="relative h-[220px] w-[300px]">
            <FruitGlyph seed="hero-a" type="Paramecia" className="bob absolute left-0 top-10 w-28 -rotate-12" />
            <FruitGlyph seed="hero-b" type="Logia" className="bob absolute right-2 top-0 w-32 rotate-6 [animation-delay:-2s]" />
            <FruitGlyph seed="hero-c" type="Mythical Zoan" className="bob absolute bottom-0 left-24 w-24 [animation-delay:-3.4s]" />
          </div>
        }
      />

      <section className="page-x mt-10">
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4">
          {types.slice(0, 4).map((t, i) => (
            <Reveal key={t.key} delay={i * 0.06} className={`panel p-5 ${i === 3 ? '!bg-ink text-paper' : ''}`}>
              <p className="t-display text-2xl text-red">{t.jp}</p>
              <p className="t-display mt-3 text-[clamp(1.3rem,2vw,1.8rem)] leading-none">{t.label}</p>
              <p className="mt-2 text-[14px] leading-snug opacity-75">{FRUIT_TYPES[t.key]?.blurb}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-x mt-16">
        <FruitExplorer fruits={lite} types={types} initialType={searchParams.type} />
      </section>
    </>
  );
}
