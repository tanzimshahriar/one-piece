export type Localized = { en?: string | null; jp?: string | null; romaji?: string | null } | string | null | undefined;

export function pickName(name: Localized, fallback = 'Unknown'): string {
  if (!name) return fallback;
  if (typeof name === 'string') return name.trim() || fallback;
  return (name.en || name.romaji || name.jp || fallback).trim();
}

export function pickJp(name: Localized): string | undefined {
  if (!name || typeof name === 'string') return undefined;
  return name.jp?.trim() || undefined;
}

export function pickRomaji(name: Localized): string | undefined {
  if (!name || typeof name === 'string') return undefined;
  return name.romaji?.trim() || undefined;
}

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'entry';
}

/** Loose key for fuzzy cross-source name matching. */
export function nameKey(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const numberFormat = new Intl.NumberFormat('en-US');
export const fmt = (n: number) => numberFormat.format(n);

export function compactBerries(n: number): string {
  if (n >= 1e9) return `${trimZeros((n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 2))}B`;
  if (n >= 1e6) return `${trimZeros((n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1))}M`;
  if (n >= 1e3) return `${trimZeros((n / 1e3).toFixed(0))}K`;
  return String(n);
}

function trimZeros(s: string) {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

export function pad(n: number, size = 2): string {
  return String(n).padStart(size, '0');
}

/** Deterministic 32-bit string hash (FNV-1a). */
export function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Seeded PRNG so server and client render identical "random" layouts. */
export function rng(seed: string | number) {
  let a = typeof seed === 'number' ? seed >>> 0 : hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "Beasts Pirates (Armored Division)" -> "Beasts Pirates"; "(former)" etc. stripped. */
export function baseAffiliation(value: string): string {
  return value.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isFormer(value: string): boolean {
  return /\((?:[^)]*\b)?(former|disbanded|defected|temporary)\b/i.test(value);
}

/** Parse "Chapter 515; Episode 409" -> { chapter: 515, episode: 409 } */
export function parseFirstAppearance(value: string | null | undefined) {
  if (!value) return { chapter: undefined, episode: undefined, raw: undefined };
  const chapter = value.match(/Chapter\s+(\d+)/i)?.[1];
  const episode = value.match(/Episode\s+(\d+)/i)?.[1];
  return {
    chapter: chapter ? Number(chapter) : undefined,
    episode: episode ? Number(episode) : undefined,
    raw: value,
  };
}

export function wikiUrl(title: string) {
  return `https://onepiece.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[,;:.\s]+$/, '')}…`;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Run async tasks with a concurrency cap, preserving input order. */
export async function pool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
