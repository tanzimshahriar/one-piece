import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FruitGlyph } from '@/components/art/FruitGlyph';
import { Arrow, Berry, SpeedLines, StatusStamp } from '@/components/art/Glyphs';
import { BountyChart, CharacterCard, Fact, InkPlate, WantedPoster } from '@/components/ui/Cards';
import { Reveal, SplitText } from '@/components/ui/Motion';
import { getCrews } from '@/lib/data/crews';
import { eraOf, getCharacter, getCharacters, getFruitHolders, toCard, withPortraits } from '@/lib/data/characters';
import { getFruits } from '@/lib/data/fruits';
import { aniListBio } from '@/lib/sources/anilist';
import { wikiImage, wikiIntro } from '@/lib/sources/wiki';
import { baseAffiliation, fmt, isFormer, nameKey } from '@/lib/util';

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const all = await getCharacters();
    return all.slice(0, 24).map((c) => ({ id: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await getCharacter(decodeURIComponent(params.id));
  if (!c) notFound();
  const bits = [c.epithet, c.bounty ? `Bounty ฿${fmt(c.bounty)}` : undefined, c.affiliations[0]].filter(Boolean).join(' · ');
  return {
    title: c.name,
    description: `${c.name}${bits ? ` — ${bits}` : ''}. Dossier, bounty history, Devil Fruit and crew in the Grand Line almanac.`,
    openGraph: c.image ? { images: [{ url: c.image }] } : undefined,
  };
}

function HeightScale({ cm, name }: { cm: number; name: string }) {
  const ref = 174;
  const max = Math.max(cm, ref, 200);
  const bar = (v: number) => `${Math.max(6, (v / max) * 100)}%`;
  return (
    <div className="flex h-28 items-end gap-3" aria-label={`${name} is ${cm} cm tall, compared with Luffy at 174 cm`}>
      <div className="flex h-full flex-col items-center justify-end gap-1">
        <div className="w-5 bg-ink" style={{ height: bar(cm) }} />
        <span className="t-kicker text-[9px]">{name.split(' ').slice(-1)[0]}</span>
      </div>
      <div className="flex h-full flex-col items-center justify-end gap-1">
        <div className="tone-hatch w-5 border-2 border-ink" style={{ height: bar(ref) }} />
        <span className="t-kicker text-[9px] text-ink-soft">Luffy</span>
      </div>
    </div>
  );
}

export default async function CharacterPage({ params }: { params: { id: string } }) {
  const c = await getCharacter(decodeURIComponent(params.id));
  if (!c) notFound();

  const [all, holders, crews, fruits, intro] = await Promise.all([getCharacters(), getFruitHolders(), getCrews(), getFruits(), wikiIntro(c.name, 4)]);
  const bio = intro ?? (await aniListBio(c.name).then((b) => (b ? { title: c.name, url: b.url, paragraphs: b.paragraphs } : null)));
  const source = intro ? 'One Piece Wiki' : bio ? 'AniList' : null;
  const portrait = c.image ?? (await wikiImage(c.name, 900));

  const held = holders.get(nameKey(c.name));
  const heldKey = held ? nameKey((held.roman_name ?? held.name).replace(/,\s*(?:Moderu|Model)\s*:?\s*/i, 'model')) : undefined;
  const fruit =
    fruits.find((f) => f.users.some((u) => u.slug === c.slug)) ??
    (heldKey ? fruits.find((f) => nameKey(f.name.replace(/,\s*Model:\s*/i, 'model')) === heldKey) : undefined);

  const crewByKey = new Map(crews.map((cr) => [nameKey(cr.name), cr]));
  const affiliations = c.affiliations.flatMap((a) => a.split(/,\s*/)).map((a) => ({ label: a, former: isFormer(a), crew: crewByKey.get(nameKey(baseAffiliation(a))) }));
  const primary = affiliations.find((a) => a.crew && !a.former)?.crew ?? affiliations.find((a) => a.crew)?.crew;
  const mates = primary
    ? await withPortraits(
        all.filter((m) => m.id !== c.id && primary.members.includes(m.id)).slice(0, 6),
        500,
      )
    : [];

  const index = all.findIndex((x) => x.id === c.id);
  const prev = index > 0 ? all[index - 1] : undefined;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : undefined;
  const era = eraOf(c);
  const jpVertical = (c.jp ?? '').replace(/[・·]/g, '');

  return (
    <article>
      <header className="page-x relative overflow-hidden pb-16 pt-[calc(var(--header-h)+4vh)]">
        {jpVertical && (
          <span
            aria-hidden
            className="tategaki t-display pointer-events-none absolute right-[2%] top-[calc(var(--header-h)+2vh)] hidden select-none text-[clamp(5rem,11vw,11rem)] leading-[0.9] text-ink/[0.07] lg:block"
          >
            {jpVertical.slice(0, 9)}
          </span>
        )}

        <div className="relative grid grid-cols-12 gap-x-6 gap-y-10 md:gap-x-10">
          <div className="col-span-12 md:col-span-5">
            <Reveal className="relative">
              <div className="tone-dots absolute inset-0 translate-x-4 translate-y-4" style={{ ['--tone-size' as string]: '6px' }} aria-hidden />
              <div className="panel relative aspect-[3/4.2]">
                {portrait ? (
                  <img src={portrait} alt={`Portrait of ${c.name}`} className="absolute inset-0 h-full w-full object-cover object-[50%_12%]" fetchPriority="high" />
                ) : (
                  <InkPlate name={c.name} jp={c.jp} />
                )}
                <SpeedLines
                  seed={c.slug}
                  inner={0.66}
                  count={120}
                  className="pointer-events-none absolute inset-0 h-full w-full text-ink opacity-70"
                  style={{ WebkitMaskImage: 'radial-gradient(circle, transparent 50%, #000 85%)', maskImage: 'radial-gradient(circle, transparent 50%, #000 85%)' }}
                />
                <span className="t-kicker absolute left-0 top-0 bg-ink px-2 py-1 text-[10px] text-paper">No. {String(index + 1).padStart(4, '0')}</span>
                {c.strawHat && <span className="t-kicker absolute right-0 top-0 bg-red px-2 py-1 text-[10px] text-paper">Straw Hat · {c.strawHat.role}</span>}
              </div>
              <StatusStamp status={c.status} className="absolute -bottom-6 -right-3 text-[15px] md:-right-6 md:text-[18px]" />
            </Reveal>
          </div>

          <div className="col-span-12 flex flex-col md:col-span-7">
            <Reveal y={12}>
              <p className="t-kicker flex flex-wrap items-center gap-3 text-[11px]">
                <Link href="/characters" className="link-ink">
                  The Cast
                </Link>
                <span className="text-ink-soft">/</span>
                <span className="text-red">Dossier · 人物記録</span>
              </p>
            </Reveal>
            {c.epithet && (
              <Reveal delay={0.1}>
                <p className="t-ital mt-6 text-[clamp(1.4rem,2.4vw,2.2rem)] leading-tight text-red">{c.epithet}</p>
              </Reveal>
            )}
            <SplitText as="h1" text={c.name} immediate delay={0.15} className="t-display mt-3 block text-[clamp(2.8rem,7vw,7rem)] uppercase leading-[0.86]" />
            <Reveal delay={0.3}>
              <p className="t-kicker mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink-soft">
                {c.jp && <span className="normal-case tracking-[0.12em] text-ink">{c.jp}</span>}
                {c.romaji && c.romaji !== c.name && <span>{c.romaji}</span>}
                {era && <span>Debut · {era} Saga</span>}
              </p>
            </Reveal>

            <Reveal delay={0.35} className="mt-10 border-t-[3px] border-ink pt-5">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="t-kicker text-[10px] text-ink-soft">{c.bounty ? 'Current bounty · 懸賞金' : 'Bounty · 懸賞金'}</p>
                  {c.bounty ? (
                    <p className="t-serif num mt-2 flex items-center gap-2 text-[clamp(2.2rem,5vw,4.6rem)] font-black leading-none">
                      <Berry className="text-red" />
                      {fmt(c.bounty)}
                    </p>
                  ) : (
                    <p className="t-display mt-2 text-3xl text-ink-soft">No price on record</p>
                  )}
                </div>
                {c.bountyHistory.length > 1 && (
                  <p className="t-kicker text-[10px] text-ink-soft">
                    ×{Math.round(c.bountyHistory[c.bountyHistory.length - 1] / c.bountyHistory[0]).toLocaleString('en-US')} since first poster
                  </p>
                )}
              </div>
              {c.bountyHistory.length > 1 && <BountyChart history={c.bountyHistory} className="mt-6" />}
            </Reveal>

            <Reveal delay={0.4}>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
                {c.age !== undefined && <Fact label="Age">{c.age}</Fact>}
                {c.height !== undefined && <Fact label="Height">{c.height} cm</Fact>}
                {c.bloodType && <Fact label="Blood type">{c.bloodType}</Fact>}
                {c.birthday && <Fact label="Birthday">{c.birthday.label}</Fact>}
                {c.origin && <Fact label="Origin">{c.origin}</Fact>}
                {c.firstAppearance.chapter && (
                  <Fact label="First appearance">
                    Ch. {c.firstAppearance.chapter}
                    {c.firstAppearance.episode ? ` · Ep. ${c.firstAppearance.episode}` : ''}
                  </Fact>
                )}
                {c.occupations.length > 0 && (
                  <Fact label="Occupation" className="col-span-2 sm:col-span-3">
                    {c.occupations.join(' · ')}
                  </Fact>
                )}
              </dl>
            </Reveal>

            {affiliations.length > 0 && (
              <Reveal delay={0.45} className="mt-6">
                <p className="t-kicker mb-3 text-[10px] text-ink-soft">Affiliations · 所属</p>
                <ul className="flex flex-wrap gap-2">
                  {affiliations.map((a) =>
                    a.crew ? (
                      <li key={a.label}>
                        <Link href={`/crews/${a.crew.slug}`} className={`chip ${a.former ? 'opacity-60' : ''}`} data-cursor="Crew">
                          {a.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={a.label} className={`chip pointer-events-none border-dashed ${a.former ? 'opacity-60' : ''}`}>
                        {a.label}
                      </li>
                    ),
                  )}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </header>

      <section className="page-x grid grid-cols-12 gap-x-6 gap-y-14 border-t-[3px] border-ink pt-14 md:gap-x-10">
        <div className="col-span-12 lg:col-span-7">
          <p className="t-kicker text-[11px] text-red">The record · 記録</p>
          {bio ? (
            <>
              <div className="prose-ink dropcap mt-6 max-w-[64ch]">
                {bio.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="t-kicker mt-8 text-[10px] text-ink-soft">
                Source:{' '}
                <a href={bio.url} target="_blank" rel="noreferrer" className="link-ink text-ink">
                  {source}
                </a>
                {source === 'One Piece Wiki' && ' · CC BY-SA 3.0'} ·{' '}
                <a href={bio.url} target="_blank" rel="noreferrer" className="link-ink text-ink">
                  Read the full article ↗
                </a>
              </p>
            </>
          ) : (
            <p className="t-ital mt-6 max-w-[48ch] text-2xl text-ink-soft">
              The Marines’ file on {c.name} is thin. {c.occupations[0] ? `Known as a ${c.occupations[0].toLowerCase()}` : 'Little is known'}
              {c.origin ? `, hailing from ${c.origin}` : ''}.
            </p>
          )}
          {c.birthday?.trivia && (
            <aside className="mt-10 max-w-md -rotate-1 border-2 border-ink bg-straw p-5 shadow-[6px_6px_0_var(--ink)]">
              <p className="t-kicker text-[10px]">SBS note · {c.birthday.label}</p>
              <p className="t-ital mt-2 text-lg leading-snug">{c.birthday.trivia}</p>
            </aside>
          )}
        </div>

        <aside className="col-span-12 space-y-12 lg:col-span-5">
          {(fruit || held) && (
            <Reveal>
              <Link
                href={fruit ? `/devil-fruits/${fruit.slug}` : '/devil-fruits'}
                className="group panel block p-6 transition-colors hover:bg-paper-2"
                data-cursor="Fruit"
              >
                <div className="tone-dots tone-fade-b absolute inset-0 opacity-10" />
                <p className="t-kicker relative text-[10px] text-red">Devil Fruit · 悪魔の実</p>
                <div className="relative mt-4 flex items-center gap-5">
                  {fruit?.image ? (
                    <img src={fruit.image} alt="" className="h-24 w-24 shrink-0 object-contain transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
                  ) : (
                    <FruitGlyph seed={fruit?.slug ?? held!.name} type={fruit?.type} className="h-24 w-24 shrink-0 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
                  )}
                  <div className="min-w-0">
                    <p className="t-display text-2xl leading-tight">{fruit?.name ?? held?.roman_name ?? held?.name}</p>
                    <p className="mt-1 text-sm text-ink-soft">{[fruit?.english, fruit?.type].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
                {(fruit?.description ?? held?.description) && (
                  <p className="relative mt-4 line-clamp-4 text-[15px] leading-relaxed text-ink-2">{fruit?.description ?? held?.description}</p>
                )}
                <p className="t-kicker relative mt-5 flex items-center gap-2 text-[10px]">
                  Open the fruit file <Arrow />
                </p>
              </Link>
            </Reveal>
          )}

          {c.bounty && (
            <Reveal className="mx-auto max-w-[340px]">
              <div className="rotate-[2.5deg]">
                <WantedPoster name={c.name} image={portrait} amount={c.bounty} status={c.status} />
              </div>
            </Reveal>
          )}

          {c.height !== undefined && (
            <Reveal className="panel p-6">
              <p className="t-kicker text-[10px] text-ink-soft">Measured against the captain</p>
              <div className="mt-4 flex items-end justify-between gap-6">
                <HeightScale cm={c.height} name={c.name} />
                <p className="t-display text-right text-4xl leading-none">
                  {c.height}
                  <span className="t-kicker ml-1 text-[11px]">cm</span>
                </p>
              </div>
            </Reveal>
          )}
        </aside>
      </section>

      {mates.length > 0 && primary && (
        <section className="page-x mt-24">
          <div className="flex items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
            <h2 className="t-display text-[clamp(1.8rem,4vw,3.4rem)] uppercase leading-none">Also aboard</h2>
            <Link href={`/crews/${primary.slug}`} className="t-kicker flex items-center gap-2 text-[11px]" data-cursor="Crew">
              {primary.name} <Arrow />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {mates.map((m) => (
              <li key={m.id}>
                <CharacterCard c={toCard(m)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="page-x mt-24 grid grid-cols-2 border-y-[3px] border-ink" aria-label="Adjacent records">
        {prev ? (
          <Link href={`/characters/${prev.slug}`} className="group border-r-[3px] border-ink py-8 pr-4" data-cursor="Prev">
            <span className="t-kicker text-[10px] text-ink-soft">← Previous record</span>
            <span className="t-display mt-2 block text-[clamp(1.2rem,3vw,2.6rem)] leading-none transition-colors group-hover:text-red">{prev.name}</span>
          </Link>
        ) : (
          <span className="border-r-[3px] border-ink" />
        )}
        {next ? (
          <Link href={`/characters/${next.slug}`} className="group py-8 pl-4 text-right" data-cursor="Next">
            <span className="t-kicker text-[10px] text-ink-soft">Next record →</span>
            <span className="t-display mt-2 block text-[clamp(1.2rem,3vw,2.6rem)] leading-none transition-colors group-hover:text-red">{next.name}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
