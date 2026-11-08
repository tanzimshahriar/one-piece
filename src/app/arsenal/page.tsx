import type { Metadata } from 'next';
import { TechniqueList } from '@/components/arsenal/TechniqueList';
import { SpeedLines } from '@/components/art/Glyphs';
import { Katana } from '@/components/art/Katana';
import { Reveal, Sfx } from '@/components/ui/Motion';
import { PageHero, SectionHead } from '@/components/ui/PageHero';
import { HAKI } from '@/lib/curated';
import { getArsenal } from '@/lib/data/library';

export const metadata: Metadata = {
  title: 'Arsenal',
  description: 'Haki, Luffy’s Gears and techniques, the graded legendary swords and Skypiea’s dials — the powers and weapons of One Piece.',
};
export const revalidate = 43200;

function Shell({ seed }: { seed: number }) {
  const turns = 3 + (seed % 3) * 0.4;
  let d = '';
  for (let t = 0; t <= turns * Math.PI * 2; t += 0.2) {
    const r = 2 + t * 1.3;
    d += `${d ? 'L' : 'M'}${(40 + Math.cos(t + seed) * r).toFixed(1)} ${(40 + Math.sin(t + seed) * r * 0.86).toFixed(1)}`;
  }
  return (
    <svg viewBox="0 0 80 80" className="w-14" aria-hidden>
      <ellipse cx="40" cy="40" rx="34" ry="29" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="40" cy="40" rx="34" ry="29" fill="url(#dial-dots)" opacity="0.4" />
    </svg>
  );
}

export default async function ArsenalPage() {
  const { hakis, gears, techniques, swords, dials } = await getArsenal();
  const grades = [...new Set(swords.map((s) => s.grade))];
  const dialTypes = [...new Set(dials.map((d) => d.type))];

  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <pattern id="dial-dots" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.9" fill="var(--ink)" />
          </pattern>
        </defs>
      </svg>

      <PageHero
        no="09"
        kicker="Arsenal"
        title="Arsenal"
        jp="覇気と武器"
        seed="arsenal"
        dek="Willpower made visible, rubber pushed past its limits, and blades with names older than nations. The tools of the trade on the Grand Line."
        stats={[
          { label: 'Haki colours', value: hakis.length || 3 },
          { label: 'Named swords', value: swords.length },
          { label: 'Luffy’s moves', value: techniques.length },
        ]}
      />

      {/* Haki */}
      <section className="page-x mt-16">
        <SectionHead no="Part I" title="Haki" jp="覇気" />
        <div className="mt-8 grid grid-cols-1 gap-[10px] md:grid-cols-3">
          {[1, 2, 3].map((id, i) => {
            const meta = HAKI[id];
            const api = hakis.find((h) => h.id === id);
            const dark = id === 2;
            const red = id === 3;
            return (
              <Reveal key={id} delay={i * 0.1} className={`panel flex min-h-[560px] flex-col p-6 ${dark ? '!bg-ink text-paper' : ''} ${red ? '!bg-red text-paper' : ''}`}>
                <SpeedLines seed={`haki-${id}`} inner={0.45} className={`pointer-events-none absolute inset-0 h-full w-full ${dark || red ? 'text-paper' : 'text-ink'} opacity-[0.12]`} />
                <div className="relative flex items-start justify-between">
                  <span className="t-kicker text-[10px] opacity-70">Colour {String(id).padStart(2, '0')}</span>
                  <span className="t-kicker text-[10px] opacity-70">{meta.romaji}</span>
                </div>
                <p className="tategaki t-display relative mx-auto my-6 text-[clamp(4rem,7vw,6.5rem)] leading-none">{meta.kanji}</p>
                <h3 className="t-display relative mt-auto text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none">{meta.name}</h3>
                <p className="t-ital relative mt-3 text-xl leading-snug">{meta.gist}</p>
                {api?.description && <p className="relative mt-3 text-[14px] leading-relaxed opacity-80">{api.description}</p>}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Gears */}
      <section className="relative mt-28 overflow-hidden bg-ink py-20 text-paper md:py-28">
        <SpeedLines seed="gears" inner={0.3} className="pointer-events-none absolute inset-0 h-full w-full text-paper opacity-[0.06]" />
        <div className="page-x relative">
          <div className="flex items-end justify-between gap-6 border-b-[3px] border-paper pb-4">
            <div>
              <p className="t-kicker text-[10px] text-straw">Part II · ギア</p>
              <h2 className="t-display mt-3 text-[clamp(2rem,5.5vw,4.6rem)] uppercase leading-none">Luffy’s Gears</h2>
            </div>
            <Sfx text="ボヨン!!" className="hidden text-[clamp(2.2rem,4.5vw,4rem)] md:inline-block" rotate={8} />
          </div>
          <ol className="no-scrollbar -mx-[var(--gutter)] mt-10 flex snap-x gap-[10px] overflow-x-auto px-[var(--gutter)] pb-2">
            {gears.map((g, i) => (
              <li key={g.id} className="w-[300px] shrink-0 snap-start">
                <Reveal delay={i * 0.06} className={`flex h-full flex-col border-[3px] border-paper p-6 ${g.short === 'Gear 5' ? 'bg-paper text-ink' : ''}`}>
                  <p className="t-display outline-paper text-[5.5rem] leading-[0.8]" style={g.short === 'Gear 5' ? { WebkitTextStroke: '1.5px var(--ink)' } : undefined}>
                    {g.short.replace('Gear ', '')}
                  </p>
                  <h3 className="t-display mt-4 text-2xl leading-tight">{g.name}</h3>
                  {g.description && <p className="mt-3 text-[14px] leading-relaxed opacity-80">{g.description}</p>}
                  <p className="t-kicker mt-auto pt-6 text-[10px] text-straw">{g.techniques ? `${g.techniques} techniques` : 'Gateway form'}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Swords */}
      <section className="page-x mt-28">
        <SectionHead no="Part III" title="The blades" jp="名刀">
          <p className="t-ital max-w-sm text-lg text-ink-soft">Ranked by the swordsmiths of old — twelve Supreme Grade, twenty-one Great Grade and fifty Skillful Grade blades.</p>
        </SectionHead>
        {grades.map((grade) => {
          const list = swords.filter((s) => s.grade === grade);
          return (
            <div key={grade} className="mt-12">
              <p className="t-kicker mb-2 flex items-center gap-3 text-[11px]">
                <span className="bg-ink px-2 py-1 text-paper">{grade}</span>
                <span className="text-red">{list[0]?.gradeJp}</span>
                <span className="text-ink-soft">· {list.length}</span>
              </p>
              <ol>
                {list.map((s, i) => (
                  <Reveal as="li" key={s.name} delay={(i % 4) * 0.05} className="group grid grid-cols-12 items-center gap-4 border-t border-ink/25 py-5">
                    <div className="col-span-12 md:col-span-3">
                      <h3 className="t-display text-2xl leading-none transition-colors group-hover:text-red">{s.name}</h3>
                      <p className="t-kicker mt-2 text-[9px] text-ink-soft">
                        {[s.type, s.destroyed ? 'Broken' : undefined].filter(Boolean).join(' · ') || 'Blade'}
                      </p>
                    </div>
                    <div className="col-span-12 transition-transform duration-700 ease-out group-hover:translate-x-3 md:col-span-5">
                      <Katana seed={s.name} black={s.type === 'Black blade' || /yoru|shusui|enma/i.test(s.name)} broken={s.destroyed} className="w-full" />
                    </div>
                    <p className="col-span-12 text-[14px] leading-relaxed text-ink-soft md:col-span-4">{s.description}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          );
        })}
      </section>

      {/* Techniques */}
      <section className="page-x mt-28">
        <SectionHead no="Part IV" title="Gomu Gomu no…" jp="技一覧" />
        <div className="mt-8">
          <TechniqueList techniques={techniques} />
        </div>
      </section>

      {/* Dials */}
      <section className="page-x mt-28">
        <SectionHead no="Part V" title="Dials" jp="貝 · ダイアル">
          <p className="t-ital max-w-sm text-lg text-ink-soft">Seashells from the White Sea that store wind, flame, sound and impact.</p>
        </SectionHead>
        {dialTypes.map((t) => (
          <div key={t} className="mt-10">
            <p className="t-kicker mb-4 text-[11px] text-ink-soft">{t}</p>
            <ul className="grid grid-cols-2 gap-[10px] sm:grid-cols-4 lg:grid-cols-6">
              {dials
                .filter((d) => d.type === t)
                .map((d, i) => (
                  <li key={`${d.name}-${i}`} className="panel flex items-center gap-3 p-3 transition-colors hover:bg-straw">
                    <Shell seed={i + d.name.length} />
                    <span className="t-display text-[15px] leading-tight">{d.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
