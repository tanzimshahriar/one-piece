import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CharacterCard, Pagination } from '@/components/ui/Cards';
import { FilterBar } from '@/components/ui/FilterBar';
import { Sfx } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { eraOf, getCharacters, toCard, withPortraits, type Character } from '@/lib/data/characters';
import { baseAffiliation, nameKey } from '@/lib/util';

export const metadata: Metadata = {
  title: 'The Cast',
  description: 'Every pirate, marine, king and stowaway in One Piece — searchable by sea, status, era and bounty.',
};

const PER_PAGE = 36;
const ERAS = ['East Blue', 'Arabasta', 'Sky Island', 'Water 7', 'Thriller Bark', 'Summit War', 'Fish-Man Island', 'Dressrosa', 'Four Emperors', 'Final'];

type Search = { q?: string; status?: string; sea?: string; era?: string; bounty?: string; crew?: string; sort?: string; page?: string };

function sortBy(list: Character[], sort?: string) {
  const out = [...list];
  switch (sort) {
    case 'name':
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case 'bounty':
      return out.sort((a, b) => (b.bounty ?? 0) - (a.bounty ?? 0) || b.score - a.score);
    case 'age':
      return out.sort((a, b) => (b.age ?? -1) - (a.age ?? -1));
    case 'height':
      return out.sort((a, b) => (b.height ?? -1) - (a.height ?? -1));
    case 'debut':
      return out.sort((a, b) => (a.firstAppearance.chapter ?? 1e6) - (b.firstAppearance.chapter ?? 1e6));
    default:
      return out;
  }
}

export default async function CharactersPage({ searchParams }: { searchParams: Search }) {
  const all = await getCharacters();
  const q = searchParams.q?.trim().toLowerCase();
  const crewKey = searchParams.crew ? nameKey(searchParams.crew) : undefined;

  const filtered = all.filter((c) => {
    if (q && ![c.name, c.jp, c.romaji, c.epithet].some((v) => v?.toLowerCase().includes(q))) return false;
    if (searchParams.status && c.status !== searchParams.status) return false;
    if (searchParams.sea && c.originSea !== searchParams.sea) return false;
    if (searchParams.era && eraOf(c) !== searchParams.era) return false;
    if (searchParams.bounty === '1' && !c.bounty) return false;
    if (crewKey && !c.affiliations.some((a) => a.split(/,\s*/).some((s) => nameKey(baseAffiliation(s)) === crewKey))) return false;
    return true;
  });
  const sorted = sortBy(filtered, searchParams.sort);
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(searchParams.page) || 1));
  const slice = await withPortraits(sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE));

  const seaCounts = new Map<string, number>();
  for (const c of all) if (c.originSea) seaCounts.set(c.originSea, (seaCounts.get(c.originSea) ?? 0) + 1);
  const seas = [...seaCounts.entries()].filter(([, n]) => n >= 8).sort((a, b) => b[1] - a[1]);
  const statusCounts = (s: string) => all.filter((c) => c.status === s).length;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(Object.entries(searchParams).filter(([k, v]) => k !== 'page' && v) as Array<[string, string]>);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/characters?${qs}` : '/characters';
  };

  const plain = !q && !searchParams.status && !searchParams.sea && !searchParams.era && !searchParams.bounty && !crewKey && !searchParams.sort;

  return (
    <>
      <PageHero
        no="01"
        kicker="The Cast"
        title="The Cast"
        jp="登場人物"
        seed="cast"
        dek={
          <>
            {all.length.toLocaleString('en-US')} souls on the record — pirates, marines, kings and stowaways. Sort them by sea, by status, or by the price on their
            head.
          </>
        }
        stats={[
          { label: 'On record', value: all.length },
          { label: 'Wanted', value: all.filter((c) => c.bounty).length },
          { label: 'Fallen', value: statusCounts('Deceased') },
        ]}
      />

      <section className="page-x relative pt-10">
        <Suspense>
          <FilterBar
            total={filtered.length}
            noun="souls"
            searchPlaceholder="Search by name, epithet or カタカナ…"
            groups={[
              {
                key: 'status',
                label: 'Status',
                options: ['Alive', 'Deceased', 'Unknown'].map((s) => ({ value: s, label: s, count: statusCounts(s) })),
              },
              { key: 'bounty', label: 'Bounty', options: [{ value: '1', label: 'Has a price' }] },
              { key: 'sea', label: 'Born in', kind: 'select', options: seas.map(([s, n]) => ({ value: s, label: s, count: n })) },
              { key: 'era', label: 'Debut saga', kind: 'select', options: ERAS.map((e) => ({ value: e, label: e })) },
            ]}
            sort={[
              { value: 'featured', label: 'Prominence' },
              { value: 'bounty', label: 'Bounty' },
              { value: 'name', label: 'Name A–Z' },
              { value: 'debut', label: 'Debut' },
              { value: 'age', label: 'Oldest' },
              { value: 'height', label: 'Tallest' },
            ]}
          />
        </Suspense>

        {searchParams.crew && (
          <p className="t-kicker mt-6 flex items-center gap-3 text-[11px]">
            <span className="bg-red px-2 py-1 text-paper">Crew</span> {searchParams.crew}
            <Link href="/characters" className="text-red underline underline-offset-4">
              remove
            </Link>
          </p>
        )}

        {slice.length ? (
          <ol className="mt-10 grid grid-flow-row-dense grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {slice.map((c, i) => {
              const feature = plain && page === 1 && (i === 0 || i === 13 || i === 26);
              return (
                <li key={c.id} className={feature ? 'col-span-2 row-span-2' : ''}>
                  <CharacterCard c={toCard(c)} index={(page - 1) * PER_PAGE + i + 1} feature={feature} />
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="relative grid place-items-center py-28 text-center">
            <Sfx text="シーン…" className="text-[clamp(3rem,9vw,7rem)]" rotate={-6} />
            <p className="t-display mt-6 text-3xl">No one by that name sails these seas.</p>
            <p className="t-ital mt-2 text-xl text-ink-soft">Try another spelling, or clear the filters.</p>
          </div>
        )}

        <Pagination page={page} pages={pages} hrefFor={hrefFor} />
      </section>
    </>
  );
}
