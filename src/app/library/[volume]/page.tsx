import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/ui/Motion';
import { FactGrid, PrevNext, RecordHero } from '@/components/ui/Record';
import { getLibrary, getVolume } from '@/lib/data/library';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    return (await getLibrary()).slice(0, 20).map((v) => ({ volume: String(v.number) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { volume: string } }): Promise<Metadata> {
  const data = await getVolume(Number(params.volume));
  if (!data) notFound();
  return { title: `Volume ${data.volume.number}: ${data.volume.title}`, description: `One Piece Volume ${data.volume.number}, “${data.volume.title}” — ${data.chapters.length} chapters.` };
}

function longDate(d?: string) {
  if (!d) return undefined;
  const date = new Date(`${d}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default async function VolumePage({ params }: { params: { volume: string } }) {
  const data = await getVolume(Number(params.volume));
  if (!data) notFound();
  const { volume: v, chapters, prev, next, saga } = data;

  return (
    <article>
      <RecordHero
        crumbs={[{ href: '/library', label: 'Library' }]}
        kicker={`Volume ${v.number} · 第${v.number}巻`}
        title={v.title}
        alt={[`${saga?.name ?? ''} Saga`, longDate(v.jpDate) ? `Released ${longDate(v.jpDate)} (Japan)` : undefined]}
        mediaKind="portrait"
        seed={`vol-${v.number}`}
        media={
          <div className="mx-auto w-[min(100%,360px)] [perspective:1200px]">
            <div className="relative transition-transform duration-700 ease-out [transform-style:preserve-3d] [transform:rotateY(-22deg)] hover:[transform:rotateY(-6deg)]">
              <div className="absolute inset-y-0 left-0 w-8 origin-left -translate-x-full border-2 border-ink [transform:rotateY(-90deg)]" style={{ background: v.tone }} />
              <div className="relative aspect-[2/3] overflow-hidden border-[3px] border-ink bg-paper-2 shadow-[18px_18px_0_rgba(18,17,16,0.18)]">
                {v.cover ? <img src={v.cover} alt={`Cover of volume ${v.number}`} className="h-full w-full object-cover" fetchPriority="high" /> : <div className="tone-dots h-full w-full opacity-30" />}
              </div>
            </div>
          </div>
        }
        facts={
          <FactGrid
            cols={2}
            items={[
              { label: 'Volume', value: v.number },
              { label: 'Chapters', value: chapters.length ? `${chapters[0].number}–${chapters[chapters.length - 1].number} (${chapters.length})` : undefined },
              { label: 'Japanese release', value: longDate(v.jpDate) },
              { label: 'Saga', value: saga ? <Link href={`/voyage#saga-${v.sagaId}`} className="link-ink">{saga.name}</Link> : undefined },
            ]}
          />
        }
      />

      {chapters.length > 0 && (
        <section className="page-x border-t-[3px] border-ink pt-14">
          <div className="flex items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
            <h2 className="t-display text-[clamp(1.8rem,4vw,3.4rem)] uppercase leading-none">Contents</h2>
            <span className="t-kicker text-[11px] text-ink-soft">目次 · {chapters.length} chapters</span>
          </div>
          <ol className="divide-y divide-ink/20">
            {chapters.map((c) => (
              <Reveal as="li" key={c.number} y={14} className="grid grid-cols-12 gap-4 py-6">
                <span className="t-display num col-span-3 text-[clamp(2rem,4vw,3.6rem)] leading-none text-red sm:col-span-2">{c.number}</span>
                <div className="col-span-9 sm:col-span-10">
                  <h3 className="t-display text-[clamp(1.1rem,1.8vw,1.6rem)] leading-tight">{c.title}</h3>
                  {c.description && <p className="mt-2 max-w-[72ch] text-[15px] leading-relaxed text-ink-soft">{c.description}</p>}
                </div>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      <PrevNext
        label="volume"
        prev={prev ? { href: `/library/${prev.number}`, title: `Vol. ${prev.number}` } : undefined}
        next={next ? { href: `/library/${next.number}`, title: `Vol. ${next.number}` } : undefined}
      />
    </article>
  );
}
