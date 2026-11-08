import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { getShips } from '@/lib/data/world';

export const metadata: Metadata = {
  title: 'Shipyard',
  description: 'The ships of One Piece — the Going Merry, Thousand Sunny, Moby Dick, Oro Jackson and every hull in between.',
};
export const revalidate = 43200;

const STATUS_JP = { Active: '航行中', Destroyed: '沈没', Unknown: '不明' } as const;

export default async function ShipsPage({ searchParams }: { searchParams: { status?: string } }) {
  const { ships, registry } = await getShips();
  const status = ['Active', 'Destroyed', 'Unknown'].includes(searchParams.status ?? '') ? searchParams.status : undefined;
  const list = status ? ships.filter((s) => s.status === status) : ships;

  return (
    <>
      <PageHero
        no="05"
        kicker="Shipyard"
        title="Shipyard"
        jp="造船所"
        seed="ships"
        dek="A ship is a crewmate that never speaks. Here are the hulls that carried dreams across the Grand Line — and the ones that went down with them."
        stats={[
          { label: 'Ships in dock', value: ships.length },
          { label: 'Lost at sea', value: ships.filter((s) => s.status === 'Destroyed').length },
          { label: 'In the registry', value: registry.length },
        ]}
      />

      <section className="page-x pt-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="t-kicker mr-1 text-[10px] text-ink-soft">Status</span>
          <Link href="/ships" className="chip" aria-current={!status ? 'page' : undefined} scroll={false}>
            All <span className="count">{ships.length}</span>
          </Link>
          {(['Active', 'Destroyed', 'Unknown'] as const).map((s) => (
            <Link key={s} href={status === s ? '/ships' : `/ships?status=${s}`} className="chip" aria-current={status === s ? 'page' : undefined} scroll={false}>
              {s} · {STATUS_JP[s]} <span className="count">{ships.filter((x) => x.status === s).length}</span>
            </Link>
          ))}
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal as="li" key={s.id} delay={(i % 3) * 0.08}>
              <Link href={`/ships/${s.slug}`} className="group block" data-cursor="Board">
                <div className="panel relative aspect-[5/4]">
                  {s.image && (
                    <img
                      src={s.image}
                      alt=""
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${s.status === 'Destroyed' ? 'grayscale' : 'duotone'}`}
                    />
                  )}
                  {s.status === 'Destroyed' && <div className="tone-cross absolute inset-0 opacity-25" style={{ ['--tone' as string]: 'var(--ink)' }} />}
                  <div className="art-waves absolute -bottom-1 left-0 h-12 w-full translate-y-2 transition-transform duration-700 group-hover:translate-y-0" />
                  <span className="t-kicker absolute left-0 top-0 bg-ink px-2 py-1 text-[9px] text-paper">No. {String(i + 1).padStart(2, '0')}</span>
                  {s.status === 'Destroyed' && (
                    <span className="stamp absolute right-4 top-4 text-[13px]" style={{ color: 'var(--red)' }}>
                      <span style={{ fontSize: '1.6em' }}>沈没</span>
                      <span className="t-kicker" style={{ fontSize: '0.6em' }}>
                        Sunk
                      </span>
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="t-display text-2xl leading-tight transition-colors group-hover:text-red">{s.name}</h2>
                    <p className="mt-1 truncate text-[14px] text-ink-soft">{s.affiliation}</p>
                  </div>
                  {s.jp && <span className="t-kicker shrink-0 pt-1 text-[10px] text-ink-soft">{s.jp}</span>}
                </div>
              </Link>
            </Reveal>
          ))}
        </ol>
      </section>

      {!status && registry.length > 0 && (
        <section className="page-x mt-28">
          <div className="flex items-end justify-between border-b-[3px] border-ink pb-4">
            <h2 className="t-display text-[clamp(2rem,5.5vw,4.6rem)] uppercase leading-none">Harbour registry</h2>
            <span className="t-kicker text-[11px] text-ink-soft">船籍簿 · {registry.length} vessels</span>
          </div>
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="mt-2 w-full min-w-[640px] text-left text-[15px]">
              <thead>
                <tr className="t-kicker text-[10px] text-ink-soft">
                  <th className="py-3 pr-4 font-medium">Vessel</th>
                  <th className="py-3 pr-4 font-medium">Class</th>
                  <th className="py-3 pr-4 font-medium">Crew</th>
                  <th className="py-3 font-medium">Captain</th>
                </tr>
              </thead>
              <tbody>
                {registry.map((b) => (
                  <tr key={b.name} className="border-t border-ink/20 transition-colors hover:bg-paper-2">
                    <td className="t-display py-3 pr-4 text-base">{b.name}</td>
                    <td className="py-3 pr-4 text-ink-soft">{b.type ?? '—'}</td>
                    <td className="py-3 pr-4 text-ink-soft">{b.crew ?? '—'}</td>
                    <td className="py-3 text-ink-soft">{b.captain ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
