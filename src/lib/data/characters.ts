import 'server-only';
import { CREW_ID_TO_AFFILIATION, STRAW_HATS } from '../curated';
import { almanac, clean, type ACharacter, type AFruit } from '../sources/almanac';
import { opapi, type RawCharacter } from '../sources/onepieceapi';
import { wikiImages } from '../sources/wiki';
import {
  UUID_RE,
  nameKey,
  parseFirstAppearance,
  pickJp,
  pickName,
  pickRomaji,
  slugify,
  splitList,
} from '../util';
import { memo } from './memo';

export type Status = 'Alive' | 'Deceased' | 'Unknown';

export type Character = {
  id: string;
  slug: string;
  name: string;
  jp?: string;
  romaji?: string;
  image?: string;
  status: Status;
  age?: number;
  height?: number;
  bloodType?: string;
  birthday?: { label: string; trivia?: string };
  epithet?: string;
  occupations: string[];
  affiliations: string[];
  origin?: string;
  originSea?: string;
  firstAppearance: { chapter?: number; episode?: number; raw?: string };
  bounty?: number;
  bountyHistory: number[];
  score: number;
  strawHat?: { role: string; jp: string; dream: string; order: number };
};

/** Light shape for client components & cards. */
export type CharacterCardData = Pick<
  Character,
  'id' | 'slug' | 'name' | 'jp' | 'image' | 'status' | 'epithet' | 'bounty' | 'strawHat'
> & { tagline?: string };

const STRAW_HAT_BY_NAME = new Map(STRAW_HATS.map((s, order) => [s.name, { ...s, order }]));


function curlyQuotes(s: string) {
  return s.replace(/"([^"]+)"/g, '“$1”').replace(/"/g, '”');
}

export function normalizeCharacter(raw: RawCharacter, alt?: ACharacter): Omit<Character, 'slug'> {
  const name = pickName(raw.name, 'Unknown');
  const extra = raw.extra_data ?? {};
  const status: Status = raw.status === 'Alive' || raw.status === 'Deceased' ? raw.status : 'Unknown';

  const bounties = (raw.bounties ?? []).filter((b) => typeof b.amount === 'number' && b.amount > 0);
  const active = bounties.find((b) => b.is_active);
  const history = bounties
    .filter((b) => !b.is_active)
    .map((b) => b.amount as number)
    .sort((a, b) => a - b);
  if (active) history.push(active.amount as number);

  const sh = STRAW_HAT_BY_NAME.get(name);
  const epithet = extra.epithet ? curlyQuotes(extra.epithet) : sh?.epithet;
  // ~5% of records (mostly major characters) ship with empty extra_data:
  // borrow crew and job from api-onepiece.com's roster.
  const altCrew = alt?.crew ? CREW_ID_TO_AFFILIATION[alt.crew.id] : undefined;
  const affiliations = splitList(extra.affiliation);
  if (!affiliations.length && (sh || altCrew)) affiliations.push(sh ? 'Straw Hat Pirates' : altCrew!);
  const occupations = splitList(extra.occupation);
  if (!occupations.length && alt?.job?.trim()) occupations.push(clean(alt.job.trim()));
  const origin = extra.origin || sh?.origin;
  const birthdayLabel = raw.birthday?.label?.en;
  const image = raw.image_url || undefined;
  const bounty = active?.amount ?? undefined;

  const score =
    (sh ? 1000 - sh.order : 0) +
    (image ? 3 : 0) +
    (bounty ? Math.log10(bounty) : 0) +
    (epithet ? 1 : 0) +
    (birthdayLabel ? 0.8 : 0) +
    Math.min(history.length, 6) * 0.4 +
    (raw.age ? 0.2 : 0);

  return {
    id: raw.id,
    name,
    jp: pickJp(raw.name),
    romaji: pickRomaji(raw.name),
    image,
    status,
    age: raw.age ?? undefined,
    height: raw.height ?? undefined,
    bloodType: raw.blood_type && raw.blood_type !== 'Unknown' ? raw.blood_type : undefined,
    birthday: birthdayLabel ? { label: birthdayLabel, trivia: raw.birthday?.trivia?.en } : undefined,
    epithet,
    occupations,
    affiliations,
    origin: origin || undefined,
    originSea: origin ? origin.split('(')[0].trim() : undefined,
    firstAppearance: parseFirstAppearance(extra.first_appearance),
    bounty,
    bountyHistory: history,
    score,
    strawHat: sh ? { role: sh.role, jp: sh.jp, dream: sh.dream, order: sh.order } : undefined,
  };
}

export function getCharacters(): Promise<Character[]> {
  return memo(
    'characters',
    async () => {
      const [raw, roster] = await Promise.all([opapi.characters(), almanac.characters()]);
      // Fail loudly so ISR keeps serving the last good page instead of caching an empty one.
      if (!raw.length) throw new Error('onepieceapi.com returned no characters');
      const byKey = new Map(roster.map((r) => [nameKey(r.name), r]));
      const normalized = raw
        .map((r) => normalizeCharacter(r, r.extra_data?.affiliation ? undefined : byKey.get(nameKey(pickName(r.name))))).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
      const used = new Map<string, number>();
      return normalized.map((c) => {
        const base = slugify(c.name);
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        return { ...c, slug: n === 0 ? base : `${base}-${c.id.slice(0, 4)}` };
      });
    },
    { isEmpty: (v) => v.length === 0 },
  );
}

export async function getCharacter(slugOrId: string): Promise<Character | null> {
  const all = await getCharacters();
  const found = all.find((c) => c.slug === slugOrId) ?? all.find((c) => c.id === slugOrId);
  if (found) return found;
  if (UUID_RE.test(slugOrId)) {
    const raw = await opapi.character(slugOrId);
    if (raw && raw.id) return { ...normalizeCharacter(raw), slug: raw.id };
  }
  return null;
}

export async function getCharacterIndex() {
  const all = await getCharacters();
  return {
    all,
    byKey: new Map(all.map((c) => [nameKey(c.name), c])),
    byId: new Map(all.map((c) => [c.id, c])),
  };
}

/** Fill missing API portraits with One Piece Wiki page images. */
export async function withPortraits<T extends { name: string; image?: string }>(items: T[], width = 500): Promise<T[]> {
  const missing = items.filter((c) => !c.image).map((c) => c.name);
  if (!missing.length) return items;
  const images = await wikiImages(missing, width);
  return items.map((c) => (c.image ? c : { ...c, image: images.get(c.name) }));
}

export function toCard(c: Character): CharacterCardData {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    jp: c.jp,
    image: c.image,
    status: c.status,
    epithet: c.epithet,
    bounty: c.bounty,
    strawHat: c.strawHat,
    tagline: c.strawHat?.role ?? c.occupations[0] ?? c.affiliations[0],
  };
}

/** Devil fruit eaten by a character, via api-onepiece.com's roster. */
export function getFruitHolders(): Promise<Map<string, AFruit & { type: string | null }>> {
  return memo('fruit-holders', async () => {
    const rows = await almanac.characters();
    const map = new Map<string, AFruit & { type: string | null }>();
    for (const row of rows) {
      if (row.fruit && row.name) map.set(nameKey(row.name), { ...row.fruit, description: clean(row.fruit.description) });
    }
    return map;
  });
}

export function eraOf(c: Pick<Character, 'firstAppearance'>) {
  const ch = c.firstAppearance.chapter;
  if (!ch) return undefined;
  if (ch <= 100) return 'East Blue';
  if (ch <= 216) return 'Arabasta';
  if (ch <= 302) return 'Sky Island';
  if (ch <= 441) return 'Water 7';
  if (ch <= 489) return 'Thriller Bark';
  if (ch <= 597) return 'Summit War';
  if (ch <= 653) return 'Fish-Man Island';
  if (ch <= 801) return 'Dressrosa';
  if (ch <= 1057) return 'Four Emperors';
  return 'Final';
}
