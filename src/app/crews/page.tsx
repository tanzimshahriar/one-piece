import type { Metadata } from 'next';
import Link from 'next/link';
import { hierarchy, pack } from 'd3-hierarchy';
import { Berry } from '@/components/art/Glyphs';
import { Reveal } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { CATEGORY_META, getCrews, type Crew, type CrewCategory } from '@/lib/data/crews';
import { compactBerries } from '@/lib/util';

export const metadata: Metadata = {
  title: 'Factions',
  description: 'Every crew, navy, kingdom and secret society in One Piece, sized by membership — with Jolly Rogers, rosters and combined bounties.',
};
export const revalidate = 43200;

const STROKE: Record<CrewCategory, string> = {
  pirate: 'var(--ink)',
  government: 'var(--sea)',
  revolution: 'var(--red)',
  realm: 'var(--straw-deep)',
  other: 'var(--ink-soft)',
};

function Pack({ crews }: { crews: Crew[] }) {
  const W = 900;
  const H = 900;
  type Node = { children?: Crew[] } | Crew;
  const root = hierarchy<Node>({ children: crews }, (d) => ('children' in d ? d.children : undefined)).sum((d) => ('memberCount' in d ? d.memberCount : 0));
  const leaves = pack<Node>().size([W, H]).padding(7)(root).leaves();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Factions sized by number of members">
      <defs>
        <pattern id="pk-dots" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="3.5" cy="3.5" r="1.2" fill="var(--ink)" />
        </pattern>
        {leaves.map((l, i) => (
          <clipPath key={i} id={`pk-c${i}`}>
            <circle cx={l.x} cy={l.y} r={l.r - 4} />
          </clipPath>
        ))}
      </defs>
      {leaves.map((l, i) => {
        const c = l.data as Crew;
        const showLabel = l.r > 34;
        const fs = Math.max(10, Math.min(20, l.r / 4.2));
        return (
          <a key={c.id} href={`/crews/${c.slug}`} className="group" aria-label={`${c.name}, ${c.memberCount} members`}>
            <circle cx={l.x} cy={l.y} r={l.r} fill="var(--paper)" stroke={STROKE[c.category]} strokeWidth={c.category === 'pirate' ? 3 : 4} />
            <circle cx={l.x} cy={l.y} r={l.r} fill="url(#pk-dots)" opacity="0.12" />
            {c.emblem && (
              <image
                href={c.emblem}
                x={l.x - l.r * 0.72}
                y={l.y - l.r * (showLabel ? 0.86 : 0.72)}
                width={l.r * 1.44}
                height={l.r * 1.44}
                preserveAspectRatio="xMidYMid meet"
                clipPath={`url(#pk-c${i})`}
                className="opacity-80 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
              />
            )}
            <circle cx={l.x} cy={l.y} r={l.r} fill="var(--red)" opacity="0" className="transition-opacity duration-300 group-hover:opacity-15" />
            {showLabel && (
              <text
                x={l.x}
                y={l.y + l.r * 0.68}
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize={fs}
                fill="var(--ink)"
                stroke="var(--paper)"
                strokeWidth="4"
                paintOrder="stroke"
              >
                {(() => {
                  const max = Math.max(4, Math.floor((l.r * 1.7) / (fs * 0.78)));
                  return c.name.length > max ? `${c.name.slice(0, max - 1).trimEnd()}…` : c.name;
                })()}
              </text>
            )}
            {showLabel && (
              <text x={l.x} y={l.y + l.r * 0.68 + fs} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={Math.max(9, fs * 0.6)} fill="var(--ink-soft)" stroke="var(--paper)" strokeWidth="3" paintOrder="stroke">
                {c.memberCount}
              </text>
            )}
            <title>{`${c.name} — ${c.memberCount} members`}</title>
          </a>
        );
      })}
    </svg>
  );
}

export default async function CrewsPage({ searchParams }: { searchParams: { cat?: string } }) {
  const crews = await getCrews();
  const cat = (Object.keys(CATEGORY_META) as CrewCategory[]).includes(searchParams.cat as CrewCategory) ? (searchParams.cat as CrewCategory) : undefined;
  const list = cat ? crews.filter((c) => c.category === cat) : crews;
  const top = crews.filter((c) => c.memberCount >= 6).slice(0, 64);

  return (
    <>
      <PageHero
        no="06"
        kicker="Factions"
        title="Factions"
        jp="勢力図"
        seed="factions"
        dek="Crews, navies, kingdoms and cults — sized by the souls who swore to them. Pirates in ink, the World Government in blue, revolutionaries in red."
        stats={[
          { label: 'Factions', value: crews.length },
          { label: 'Pirate crews', value: crews.filter((c) => c.category === 'pirate').length },
          { label: 'Emperor crews', value: crews.filter((c) => c.yonko).length },
        ]}
      />

      <section className="page-x mt-6">
        <div className="grid grid-cols-12 gap-[10px]">
          <div className="panel col-span-12 bg-paper p-2 md:p-6 lg:col-span-7">
            <Pack crews={top} />
          </div>
          <div className="panel col-span-12 flex flex-col bg-ink p-6 text-paper lg:col-span-5">
            <p className="t-kicker text-[10px] text-straw">Largest banners · 大勢力</p>
            <ol className="mt-4 flex-1 divide-y divide-paper/15">
              {crews.slice(0, 12).map((c, i) => (
                <li key={c.id}>
                  <Link href={`/crews/${c.slug}`} className="group grid grid-cols-12 items-center gap-3 py-2.5">
                    <span className="t-kicker num col-span-1 text-[10px] text-paper/50">{String(i + 1).padStart(2, '0')}</span>
                    <span className="t-display col-span-6 truncate text-[15px] transition-colors group-hover:text-straw">{c.name}</span>
                    <span className="col-span-4 h-2 bg-paper/10">
                      <span className="block h-full" style={{ width: `${(c.memberCount / crews[0].memberCount) * 100}%`, background: c.category === 'pirate' ? 'var(--paper)' : STROKE[c.category] }} />
                    </span>
                    <span className="t-kicker num col-span-1 text-right text-[10px]">{c.memberCount}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="t-ital mt-6 text-lg leading-snug text-paper/70">Membership counts every name ever sworn to the flag — the Marines win on headcount, the Emperors on bounty.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {(Object.keys(CATEGORY_META) as CrewCategory[]).map((k) => (
            <span key={k} className="t-kicker flex items-center gap-2 text-[10px]">
              <span className="h-3.5 w-3.5 rounded-full border-[3px]" style={{ borderColor: STROKE[k] }} />
              {CATEGORY_META[k].label} · {CATEGORY_META[k].jp}
            </span>
          ))}
        </div>
      </section>

      <section className="page-x mt-24">
        <div className="flex flex-col gap-6 border-b-[3px] border-ink pb-4 md:flex-row md:items-end md:justify-between">
          <h2 className="t-display text-[clamp(2rem,5.5vw,4.6rem)] uppercase leading-none">Every banner</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/crews" className="chip" aria-current={!cat ? 'page' : undefined} scroll={false}>
              All <span className="count">{crews.length}</span>
            </Link>
            {(Object.keys(CATEGORY_META) as CrewCategory[]).map((k) => (
              <Link key={k} href={cat === k ? '/crews' : `/crews?cat=${k}`} className="chip" aria-current={cat === k ? 'page' : undefined} scroll={false}>
                {CATEGORY_META[k].label} <span className="count">{crews.filter((c) => c.category === k).length}</span>
              </Link>
            ))}
          </div>
        </div>
        <ol className="mt-8 grid grid-cols-2 gap-[10px] sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {list.map((c, i) => (
            <Reveal as="li" key={c.id} delay={(i % 6) * 0.03}>
              <Link href={`/crews/${c.slug}`} className="group panel flex h-full flex-col transition-colors hover:bg-paper-2" data-cursor="Crew">
                <div className="relative grid aspect-square place-items-center border-b-[3px] border-ink bg-paper">
                  <div className="tone-dots absolute inset-0 opacity-10" />
                  {c.emblem ?? c.topImage ? (
                    <img src={c.emblem ?? c.topImage ?? ""} alt="" loading="lazy" className="relative max-h-[78%] max-w-[78%] object-contain grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
                  ) : (
                    <span className="t-display relative text-5xl text-ink/20">{c.name.charAt(0)}</span>
                  )}
                  {c.yonko && <span className="t-kicker absolute right-0 top-0 bg-red px-2 py-1 text-[9px] text-paper">Emperor</span>}
                  <span className="absolute bottom-0 left-0 h-1.5 w-full" style={{ background: STROKE[c.category] }} />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="t-display text-[15px] leading-tight transition-colors group-hover:text-red">{c.name}</p>
                  <p className="t-kicker mt-auto flex items-center justify-between pt-3 text-[9px] text-ink-soft">
                    <span>{c.memberCount} members</span>
                    {c.totalBounty > 0 && (
                      <span className="flex items-center gap-0.5 text-ink">
                        <Berry className="text-red" />
                        {compactBerries(c.totalBounty)}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
