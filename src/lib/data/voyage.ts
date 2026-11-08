import 'server-only';
import { ARCS, SAGAS } from '../curated';
import { almanac, clean, type AEpisode } from '../sources/almanac';
import { wikiImages } from '../sources/wiki';
import { memo } from './memo';

export type Arc = {
  id: number;
  slug: string;
  name: string;
  sagaId: number;
  filler: boolean;
  special: boolean;
  description?: string;
  image?: string;
  episodes?: { from: number; to: number; count: number };
};

export type Saga = {
  id: number;
  name: string;
  jp: string;
  tone: string;
  chapters: string;
  episodes: string;
  volumes: string;
  arcs: Arc[];
};

export type Episode = {
  number: number;
  title: string;
  description?: string;
  airDate?: string;
  chapters?: string;
  image?: string;
};

function epNumber(e: AEpisode) {
  // Upstream numbers are free text ("n°11", "N°1032", "11++"); ids track episode numbers.
  const n = Number(e.number?.match(/\d+/)?.[0]);
  return Number.isFinite(n) && n > 0 && Math.abs(n - e.id) <= 3 ? n : e.id;
}

function arcSlug(id: number) {
  const name = ARCS[id]?.name ?? `arc-${id}`;
  return `${String(id).padStart(2, '0')}-${name.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
}

export function getVoyage(): Promise<Saga[]> {
  return memo(
    'voyage',
    async () => {
      const [arcs, ...episodeLists] = await Promise.all([
        almanac.arcs(),
        ...Object.keys(SAGAS).map((id) => almanac.episodesBySaga(Number(id))),
      ]);

      if (!arcs.length) throw new Error('api-onepiece.com returned no arcs');
      const ranges = new Map<number, { from: number; to: number; count: number }>();
      for (const list of episodeLists) {
        for (const e of list) {
          const arcId = e.arc?.id;
          if (!arcId) continue;
          const n = epNumber(e);
          const r = ranges.get(arcId);
          if (!r) ranges.set(arcId, { from: n, to: n, count: 1 });
          else {
            r.from = Math.min(r.from, n);
            r.to = Math.max(r.to, n);
            r.count += 1;
          }
        }
      }

      const art = await wikiImages(Object.values(ARCS).map((a) => a.wiki), 900);

      const arcRecords: Arc[] = (arcs.length ? arcs : Object.keys(ARCS).map((id) => ({ id: Number(id), title: '', description: null, saga: null })))
        .map((a) => {
          const meta = ARCS[a.id];
          return {
            id: a.id,
            slug: arcSlug(a.id),
            name: meta?.name ?? clean(a.title).replace(/^Arc\s+/i, '').replace(/\s+(Arc|Bow|Arch)$/i, ''),
            sagaId: a.saga?.id ?? sagaForArc(a.id),
            filler: Boolean(meta?.filler),
            special: Boolean(meta?.special),
            description: cleanArcDescription(a.description, meta?.name),
            image: meta ? art.get(meta.wiki) : undefined,
            episodes: ranges.get(a.id),
          };
        })
        .sort((x, y) => x.id - y.id);

      return Object.entries(SAGAS).map(([id, s]) => ({
        id: Number(id),
        ...s,
        arcs: arcRecords.filter((a) => a.sagaId === Number(id)),
      }));
    },
    { isEmpty: (v) => v.every((s) => s.arcs.length === 0) },
  );
}

function sagaForArc(id: number) {
  if (id <= 8) return 1;
  if (id <= 17) return 2;
  if (id <= 20) return 3;
  if (id <= 26) return 4;
  if (id <= 29) return 5;
  if (id <= 35) return 6;
  if (id <= 38) return 7;
  if (id <= 41) return 8;
  if (id <= 48) return 9;
  return 10;
}

function cleanArcDescription(text: string | null, name?: string) {
  const out = clean(text);
  if (!out || out.length < 40) return undefined;
  if (name && out.toLowerCase() === `${name.toLowerCase()} arc`) return undefined;
  return out;
}

export async function getArc(slug: string) {
  const sagas = await getVoyage();
  const arcs = sagas.flatMap((s) => s.arcs);
  const index = arcs.findIndex((a) => a.slug === slug || String(a.id) === slug);
  if (index < 0) return null;
  const arc = arcs[index];
  const saga = sagas.find((s) => s.id === arc.sagaId)!;

  const raw = await almanac.episodesByArc(arc.id);
  const sorted = raw.sort((a, b) => epNumber(a) - epNumber(b));
  const stills = await wikiImages(sorted.map((e) => `Episode ${epNumber(e)}`), 480);
  const episodes: Episode[] = sorted.map((e) => {
    const n = epNumber(e);
    return {
      number: n,
      title: clean(e.title),
      description: clean(e.description) || undefined,
      airDate: e.release_date ?? undefined,
      chapters: e.chapter ? e.chapter.replace(/^(Chap|Ch)\.?\s*/i, '') : undefined,
      image: stills.get(`Episode ${n}`),
    };
  });

  return { arc, saga, episodes, prev: arcs[index - 1], next: arcs[index + 1] };
}
