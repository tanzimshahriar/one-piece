import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/art/Glyphs';
import { Reveal } from '@/components/ui/Motion';
import { PageHero } from '@/components/ui/PageHero';
import { VoyageRail } from '@/components/voyage/VoyageRail';
import { getVoyage } from '@/lib/data/voyage';
import { almanac } from '@/lib/sources/almanac';
import { truncate } from '@/lib/util';

export const metadata: Metadata = {
  title: 'The Voyage',
  description: 'Every saga and arc of One Piece in order — chapters, episode ranges, filler flagged, with cover art for each arc.',
};
export const revalidate = 43200;

export default async function VoyagePage() {
  const [sagas, episodeCount] = await Promise.all([getVoyage(), almanac.episodeCount()]);
  const arcs = sagas.flatMap((s) => s.arcs);

  return (
    <>
      <PageHero
        no="07"
        kicker="The Voyage"
        title="The Voyage"
        jp="航海日誌"
        seed="voyage"
        dek="From a barrel adrift in the East Blue to the land of giants. Every saga and every arc of the story so far — filler flagged, so you can chart your own course."
        stats={[
          { label: 'Sagas', value: sagas.length },
          { label: 'Arcs', value: arcs.length },
          { label: 'Episodes', value: typeof episodeCount === 'number' ? episodeCount : 1180 },
        ]}
      />

      <nav className="page-x no-scrollbar sticky top-[var(--header-h)] z-20 -mt-px flex gap-1 overflow-x-auto border-b-[3px] border-ink bg-paper/95 py-2 backdrop-blur" aria-label="Sagas">
        {sagas.map((s) => (
          <a key={s.id} href={`#saga-${s.id}`} className="t-kicker shrink-0 px-3 py-2 text-[10px] transition-colors hover:bg-ink hover:text-paper">
            {String(s.id).padStart(2, '0')} {s.name}
          </a>
        ))}
      </nav>

      <VoyageRail>
        {sagas.map((s) => (
          <section key={s.id} id={`saga-${s.id}`} className="page-x grid scroll-mt-[calc(var(--header-h)+60px)] grid-cols-12 gap-x-8 gap-y-8 border-b border-ink/20 py-16 md:py-24">
            <div className="col-span-12 md:col-span-4">
              <div className="md:sticky md:top-[calc(var(--header-h)+80px)]">
                <p className="t-kicker text-[10px]" style={{ color: s.tone === '#111010' ? 'var(--red)' : s.tone }}>
                  Saga {String(s.id).padStart(2, '0')} · {s.jp}
                </p>
                <p className="t-display outline-ink mt-2 text-[clamp(5rem,11vw,10rem)] leading-[0.8]">{String(s.id).padStart(2, '0')}</p>
                <h2 className="t-display mt-3 text-[clamp(2rem,3.6vw,3.4rem)] uppercase leading-[0.9]">{s.name}</h2>
                <dl className="mt-6 grid grid-cols-3 border-t-[3px] border-ink">
                  {[
                    ['Chapters', s.chapters],
                    ['Episodes', s.episodes],
                    ['Volumes', s.volumes],
                  ].map(([k, v]) => (
                    <div key={k} className="pt-3">
                      <dt className="t-kicker text-[9px] text-ink-soft">{k}</dt>
                      <dd className="num mt-1 text-[15px] font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <span className="mt-6 block h-2 w-24" style={{ background: s.tone }} />
              </div>
            </div>

            <ol className="col-span-12 space-y-6 md:col-span-8">
              {s.arcs.map((a) => (
                <Reveal as="li" key={a.id}>
                  <Link href={`/voyage/${a.slug}`} className="group panel grid grid-cols-1 sm:grid-cols-5" data-cursor="Read">
                    <div className="relative aspect-[16/10] border-b-[3px] border-ink sm:col-span-2 sm:aspect-auto sm:min-h-[200px] sm:border-b-0 sm:border-r-[3px]">
                      {a.image ? (
                        <img src={a.image} alt="" loading="lazy" className="duotone absolute inset-0 h-full w-full object-cover group-hover:scale-105" />
                      ) : (
                        <div className="tone-dots absolute inset-0 opacity-30" />
                      )}
                      <span className="t-display absolute left-0 top-0 bg-ink px-2 py-1 text-sm text-paper">{String(a.id).padStart(2, '0')}</span>
                    </div>
                    <div className="flex flex-col p-5 sm:col-span-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.filler && <span className="t-kicker border-2 border-ink px-2 py-0.5 text-[9px]">Filler · アニオリ</span>}
                        {a.special && <span className="t-kicker border-2 border-ink px-2 py-0.5 text-[9px]">Cover story</span>}
                        {!a.filler && !a.special && <span className="t-kicker bg-red px-2 py-0.5 text-[9px] text-paper">Canon</span>}
                        {a.episodes && (
                          <span className="t-kicker num text-[10px] text-ink-soft">
                            Ep. {a.episodes.from}–{a.episodes.to} · {a.episodes.count} episodes
                          </span>
                        )}
                      </div>
                      <h3 className="t-display mt-3 text-[clamp(1.5rem,2.6vw,2.4rem)] leading-none transition-colors group-hover:text-red">{a.name}</h3>
                      {a.description && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{truncate(a.description, 240)}</p>}
                      <span className="t-kicker mt-auto flex items-center gap-2 pt-4 text-[10px]">
                        Open the arc <Arrow />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ol>
          </section>
        ))}
      </VoyageRail>
    </>
  );
}
