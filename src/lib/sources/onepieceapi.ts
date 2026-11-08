import 'server-only';
import { pool, type Localized } from '../util';

/**
 * onepieceapi.com — characters, devil fruits, bounties, ships, islands and
 * affiliations. Its list endpoints paginate over a non-unique sort key, so
 * pages of different sizes overlap and drop rows. We take the union of a few
 * page sizes, which recovers ~99.5% of records.
 */

const BASE = 'https://www.onepieceapi.com/api';
const REVALIDATE = 60 * 60 * 12;

export type RawBounty = {
  id: string;
  amount: number | null;
  is_active: boolean;
  created_at?: string;
  character_id?: string | null;
};

export type RawCharacter = {
  id: string;
  name: Localized;
  age: number | null;
  status: string | null;
  height: number | null;
  blood_type: string | null;
  birthday: {
    day?: number;
    month?: number;
    label?: { en?: string; jp?: string };
    trivia?: { en?: string };
  } | null;
  image_url: string | null;
  extra_data: {
    origin?: string;
    epithet?: string;
    occupation?: string;
    affiliation?: string;
    first_appearance?: string;
  } | null;
  bounties: RawBounty[];
};

export type RawFruit = {
  id: string;
  type: string | null;
  name: Localized;
  model: Localized;
  sub_type: string | null;
  image_url: string | null;
};

export type RawBountyRow = RawBounty & {
  characters: { name: Localized; status: string | null; image_url: string | null } | null;
};

export type RawShip = {
  id: string;
  name: Localized;
  image_url: string | null;
  type: string | null;
  status: string | null;
  extra_data: { height?: string | null; length?: string | null; affiliation?: string | null; first_appearance?: string | null } | null;
};

export type RawIsland = {
  id: string;
  name: Localized;
  image_url: string | null;
  sea: string | null;
  extra_data: { type?: string | null; population?: string | null; affiliation?: string | null; first_appearance?: string | null } | null;
};

export type RawAffiliation = {
  id: string;
  name: Localized;
  memberCount: number;
};

async function getJson<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE, tags: ['onepieceapi'] } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchPages<T>(path: string, limit: number, extra: Record<string, string> = {}): Promise<T[]> {
  const out: T[] = [];
  const BATCH = 6;
  for (let start = 1; start < 60; start += BATCH) {
    const pages = Array.from({ length: BATCH }, (_, i) => start + i);
    const batch = await pool(pages, BATCH, (page) => getJson<T[]>(path, { ...extra, page, limit }));
    let done = false;
    for (const rows of batch) {
      if (!Array.isArray(rows)) {
        done = true;
        continue;
      }
      out.push(...rows);
      if (rows.length < limit) done = true;
    }
    if (done) break;
  }
  return out;
}

async function fetchAllUnion<T extends { id: string }>(path: string, limits: number[], extra: Record<string, string> = {}) {
  const byId = new Map<string, T>();
  for (const limit of limits) {
    const rows = await fetchPages<T>(path, limit, extra);
    for (const row of rows) if (row && typeof row.id === 'string' && !byId.has(row.id)) byId.set(row.id, row);
  }
  return [...byId.values()];
}

export const opapi = {
  characters: () => fetchAllUnion<RawCharacter>('characters', [100, 91, 83]),
  character: (id: string) => getJson<RawCharacter>(`characters/${id}`),
  searchCharacters: (q: string) => getJson<RawCharacter[]>('characters', { q, limit: 20 }),
  fruits: () => fetchAllUnion<RawFruit>('devil-fruits', [100, 91]),
  bounties: () => fetchAllUnion<RawBountyRow>('bounties', [100, 91], { sort: 'high' }),
  ships: () => fetchAllUnion<RawShip>('ships', [100]),
  islands: () => fetchAllUnion<RawIsland>('islands', [100]),
  affiliations: () => fetchAllUnion<RawAffiliation>('affiliations', [100, 91]),
};
