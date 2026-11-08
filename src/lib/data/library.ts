import 'server-only';
import { SAGAS, SWORD_GRADES } from '../curated';
import { almanac, clean, parseNumber } from '../sources/almanac';
import { wikiImages } from '../sources/wiki';
import { memo } from './memo';

/* ───────────────────────────── Library ───────────────────────────── */

export type Volume = {
  id: number;
  number: number;
  title: string;
  jpDate?: string;
  cover?: string;
  sagaId: number;
  tone: string;
};

function sagaForVolume(n: number) {
  for (const [id, s] of Object.entries(SAGAS)) {
    const [from, to] = s.volumes.split('–').map((v) => (v ? Number(v) : Infinity));
    if (n >= from && n <= (Number.isFinite(to) ? to : Infinity)) return Number(id);
  }
  return 10;
}

const SMALL_WORDS = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'to', 'in', 'on', 'at', 'for', 'by', 'vs', 'versus', 'with']);

export function titleCase(input: string) {
  return input
    .toLowerCase()
    .split(/(\s+)/)
    .map((word, i) =>
      i > 0 && SMALL_WORDS.has(word) ? word : word.replace(/^([("“'‘]?)(\p{L})/u, (_, p: string, c: string) => p + c.toUpperCase()),
    )
    .join('');
}

function volumeTitle(raw: string) {
  const cleaned = clean(raw);
  const [head, ...rest] = cleaned.split(/\s+-\s+/);
  return titleCase(rest.length && head === head.toUpperCase() ? head : cleaned);
}

export function getLibrary(): Promise<Volume[]> {
  return memo(
    'library',
    async () => {
      const tomes = await almanac.tomes();
      if (!tomes.length) throw new Error('api-onepiece.com returned no volumes');
      const seen = new Set<number>();
      const numbers = tomes.map((t) => {
        // Upstream numbering has typos and repeats; ids track volume order.
        const parsed = parseNumber(t.tome_number);
        const n = parsed && Math.abs(parsed - t.id) <= 2 && !seen.has(parsed) ? parsed : t.id;
        seen.add(n);
        return n;
      });
      const covers = await wikiImages(numbers.map((n) => `Volume ${n}`), 420);
      return tomes
        .map((t, i) => {
          const number = numbers[i];
          const sagaId = sagaForVolume(number);
          return {
            id: t.id,
            number,
            title: volumeTitle(t.title),
            jpDate: t.tome_japan_date_publish ?? undefined,
            cover: covers.get(`Volume ${number}`),
            sagaId,
            tone: SAGAS[sagaId]?.tone ?? '#111',
          };
        })
        .sort((a, b) => a.number - b.number);
    },
    { isEmpty: (v) => v.length === 0 },
  );
}

export async function getVolume(n: number) {
  const volumes = await getLibrary();
  const index = volumes.findIndex((v) => v.number === n);
  if (index < 0) return null;
  const volume = volumes[index];
  const chapters = (await almanac.chaptersByTome(volume.id))
    .map((c) => ({ number: c.id, title: clean(c.title), description: clean(c.description) || undefined }))
    .sort((a, b) => a.number - b.number);
  return { volume, chapters, prev: volumes[index - 1], next: volumes[index + 1], saga: SAGAS[volume.sagaId] };
}

/* ───────────────────────────── Arsenal ───────────────────────────── */

export type Gear = { id: number; short: string; name: string; description?: string; techniques: number };
export type Technique = { id: number; name: string; english: string; description?: string; type: string };
export type Sword = { name: string; description?: string; type?: string; grade: string; gradeJp: string; rank: number; destroyed: boolean };
export type Dial = { name: string; type: string };

const DIAL_NAMES: Record<string, string> = {
  'Flamme-Dial': 'Flame Dial',
  'Lampe-Dial': 'Lamp Dial',
  'Diial des Ténèbres': 'Dark Dial',
  'Reject-Dia': 'Reject Dial',
};

const DIAL_TYPES: Record<string, string> = {
  Dials: 'Shells',
  Dial: 'Shells',
  'Arme basées sur les Dials': 'Dial weapons',
  'Transports basés sur les Dials': 'Dial vessels',
};

export function getArsenal() {
  return memo('arsenal', async () => {
    const [hakis, gears, techniques, swords, dials] = await Promise.all([
      almanac.hakis(),
      almanac.gears(),
      almanac.techniques(),
      almanac.swords(),
      almanac.dials(),
    ]);

    return {
      hakis: hakis.map((h) => ({ id: h.id, description: capitalise(clean(h.description)) })),
      gears: gears.map((g): Gear => {
        const [short, long] = g.name.split(/\s*\/\s*/);
        const [base, form] = (long ?? short).split(/\s*:\s*/);
        return {
          id: g.id,
          short: short.trim(),
          name: form ? `${base.trim()}: ${form.replace(/\s+/g, '').replace(/Man$/i, 'man')}` : (long ?? short).trim(),
          description: clean(g.description) || undefined,
          techniques: g.count_technique,
        };
      }),
      techniques: techniques.map(
        (t): Technique => ({
          id: t.id,
          name: clean(t.name),
          english: clean(t.name).replace(/^Gomu Gomu no\s*/i, 'Gum-Gum ').replace(/^Gomu\s+/i, 'Gum '),
          description: clean(t.description) || undefined,
          type: /sp[ée]ciale/i.test(t.type ?? '') ? 'Special' : /autre/i.test(t.type ?? '') ? 'Other' : 'Standard',
        }),
      ),
      swords: swords
        .map((s): Sword => {
          const grade = SWORD_GRADES[s.category ?? ''] ?? SWORD_GRADES[''];
          return {
            name: clean(s.name).replace(/^\w/, (m) => m.toUpperCase()),
            description: clean(s.description) || undefined,
            type: s.type === 'Lame noire' ? 'Black blade' : s.type === 'Coutelas' ? 'Cutlass' : s.type || undefined,
            grade: grade.name,
            gradeJp: grade.jp,
            rank: grade.rank,
            destroyed: s.isDestroy,
          };
        })
        .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name)),
      dials: dials.map(
        (d): Dial => ({
          name: DIAL_NAMES[d.name] ?? d.name.replace(/-Dial$/, ' Dial').replace(/é/g, 'e'),
          type: DIAL_TYPES[d.type ?? ''] ?? 'Shells',
        }),
      ),
    };
  });
}

function capitalise(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
