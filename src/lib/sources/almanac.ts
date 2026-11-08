import 'server-only';

/**
 * api-onepiece.com (v2, English locale) — sagas, arcs, episodes, chapters,
 * volumes, haki, swords, dials, Luffy's gears & techniques, crews, boats and
 * fruits with descriptions. The English text is machine-translated from
 * French, so everything passes through `clean()` on the way in.
 */

const BASE = 'https://api.api-onepiece.com/v2';
const REVALIDATE = 60 * 60 * 12;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/${path}`, { next: { revalidate: REVALIDATE, tags: ['almanac'] } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/Chapeau de Paille/g, 'Straw Hat'],
  [/\bLe Roux\b/g, 'Red Hair'],
  [/Barbe Blanche/g, 'Whitebeard'],
  [/Barbe Noire/g, 'Blackbeard'],
  [/\bDemon Fruits?\b/g, 'Devil Fruit'],
  [/\bdemon fruits?\b/g, 'Devil Fruit'],
  [/Fruit of the Demon/g, 'Devil Fruit'],
  [/\bKobby\b/g, 'Koby'],
  [/\bBaggy\b/g, 'Buggy'],
  [/\bHermep\b/g, 'Helmeppo'],
  [/\bZorro\b/g, 'Zoro'],
  [/\bPipo\b/g, 'Usopp'],
  [/\bLord of the Pirates\b/g, 'King of the Pirates'],
  [/\bcelestial dragons?\b/gi, 'Celestial Dragons'],
  [/\bîle\b/gi, 'Island'],
  [/\bÎle\b/g, 'Island'],
  [/\barchipel\b/gi, 'Archipelago'],
  [/\broyaume\b/gi, 'Kingdom'],
  [/\bvillage de\b/gi, 'Village of'],
  [/\bMarine Ford\b/g, 'Marineford'],
  [/\bRêverie\b/g, 'Levely'],
  [/\bPays des Wa\b/g, 'Wano Country'],
  [/\s+\n/g, '\n'],
];

export function clean(text: string | null | undefined): string {
  if (!text) return '';
  let out = text;
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  return out.replace(/ /g, ' ').trim();
}

export function parseRange(value: string | null | undefined) {
  if (!value) return undefined;
  const m = value.match(/(\d+)\s*(?:à|-|to)\s*(\d+|\?)/);
  if (!m) return undefined;
  return { from: Number(m[1]), to: m[2] === '?' ? undefined : Number(m[2]) };
}

export function parseNumber(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : undefined;
}

export type ASaga = { id: number; title: string; saga_number: string; saga_chapitre: string; saga_volume: string; saga_episode: string };
export type AArc = { id: number; title: string; description: string | null; saga: ASaga | null };
export type AEpisode = {
  id: number;
  title: string;
  description: string | null;
  number: string;
  chapter: string | null;
  release_date: string | null;
  arc?: { id: number; title: string } | null;
  saga?: { id: number } | null;
};
export type ATome = { id: number; title: string; tome_number: string; tome_japan_date_publish: string | null; tome_french_date_publish?: string | null };
export type AChapter = { id: number; title: string; description: string | null; tome?: ATome | null };
export type ACrew = {
  id: number;
  name: string;
  description: string | null;
  status: string | null;
  roman_name: string | null;
  total_prime: string | null;
  number: string | null;
  is_yonko: boolean;
};
export type AFruit = { id: number; name: string; description: string | null; roman_name: string | null; type: string | null; filename: string | null };
export type ACharacter = {
  id: number;
  name: string;
  size: string | null;
  age: string | null;
  bounty: string | null;
  job: string | null;
  status: string | null;
  crew: ACrew | null;
  fruit: AFruit | null;
};
export type ABoat = {
  id: number;
  name: string;
  description: string | null;
  type: string | null;
  roman_name: string | null;
  crew: ACrew | null;
  character_captain: { id: number; name: string } | null;
};
export type AHaki = { id: number; name: string; description: string | null; roman_name: string | null };
export type ASword = { name: string; roman_name: string | null; description: string | null; type: string | null; category: string | null; isDestroy: boolean };
export type ADial = { name: string; type: string | null };
export type AGear = { id: number; name: string; description: string | null; count_technique: number };
export type ATechnique = { id: number; name: string; translation: string | null; description: string | null; type: string | null; after_ellipsis: boolean };
export type ALocate = { id: number; name: string; region_name: string | null; roman_name: string | null; sea_name: string | null; affiliation_name: string | null };

const list = <T>(path: string) => getJson<T[]>(path).then((rows) => (Array.isArray(rows) ? rows : []));

export const almanac = {
  sagas: () => list<ASaga>('sagas/en'),
  arcs: () => list<AArc>('arcs/en'),
  episodesBySaga: (sagaId: number) => list<AEpisode>(`episodes/en/saga/${sagaId}`),
  episodesByArc: (arcId: number) => list<AEpisode>(`episodes/en/arc/${arcId}`),
  episodeCount: () => getJson<number>('episodes/en/count'),
  chapterCount: () => getJson<number>('chapters/en/count'),
  tomes: () => list<ATome>('tomes/en'),
  chaptersByTome: (tomeId: number) => list<AChapter>(`chapters/en/tome/${tomeId}`),
  crews: () => list<ACrew>('crews/en'),
  fruits: () => list<AFruit>('fruits/en'),
  characters: () => list<ACharacter>('characters/en'),
  boats: () => list<ABoat>('boats/en'),
  hakis: () => list<AHaki>('hakis/en'),
  swords: () => list<ASword>('swords/en'),
  dials: () => list<ADial>('dials/en'),
  gears: () => list<AGear>('luffy-gears/en'),
  techniques: () => list<ATechnique>('luffy-techniques/en'),
  locates: () => list<ALocate>('locates/en'),
};
