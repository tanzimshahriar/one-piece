import 'server-only';
import { CREW_ID_TO_AFFILIATION } from '../curated';
import { almanac, parseNumber } from '../sources/almanac';
import { opapi } from '../sources/onepieceapi';
import { wikiImages } from '../sources/wiki';
import { baseAffiliation, isFormer, nameKey, pickName, slugify } from '../util';
import { getCharacters, type Character } from './characters';
import { memo } from './memo';

export type CrewCategory = 'pirate' | 'government' | 'revolution' | 'realm' | 'other';

export const CATEGORY_META: Record<CrewCategory, { label: string; jp: string; tone: string }> = {
  pirate: { label: 'Pirate crews', jp: '海賊', tone: 'var(--ink)' },
  government: { label: 'World Government', jp: '世界政府', tone: 'var(--sea)' },
  revolution: { label: 'Revolutionaries', jp: '革命軍', tone: 'var(--red)' },
  realm: { label: 'Realms & families', jp: '王国・一族', tone: 'var(--straw-deep)' },
  other: { label: 'Guilds & others', jp: '組織', tone: 'var(--ink-soft)' },
};

export function categorize(name: string): CrewCategory {
  if (/revolution/i.test(name)) return 'revolution';
  if (/marine|navy|government|cipher|^cp\d|^cp0|impel down|pacifista|seraphim|world noble|god'?s knights|five elders|sword|enies lobby/i.test(name)) return 'government';
  if (/pirates|crew|fleet|armada|club|alliance|corsair/i.test(name)) return 'pirate';
  if (/kingdom|family|royal|clan|tribe|country|dukedom|nation|empire|village|town|island|ohara|shandia|mink|kozuki|kouzuki|people|warriors|army/i.test(name)) return 'realm';
  return 'other';
}

export type Crew = {
  id: string;
  slug: string;
  name: string;
  category: CrewCategory;
  memberCount: number;
  members: string[]; // character ids, current
  formerMembers: string[];
  totalBounty: number;
  topImage?: string; // best member portrait
  emblem?: string; // wiki page image (often a Jolly Roger)
  yonko?: boolean;
  roman?: string;
};

export function getCrews(): Promise<Crew[]> {
  return memo(
    'crews',
    async () => {
      const [rows, characters, aCrews] = await Promise.all([opapi.affiliations(), getCharacters(), almanac.crews()]);

      const membership = new Map<string, { current: Character[]; former: Character[] }>();
      for (const c of characters) {
        const segments = c.affiliations.flatMap((a) => a.split(/,\s*/));
        for (const seg of segments) {
          const key = nameKey(baseAffiliation(seg));
          if (!key) continue;
          const bucket = membership.get(key) ?? { current: [], former: [] };
          (isFormer(seg) ? bucket.former : bucket.current).push(c);
          membership.set(key, bucket);
        }
      }

      const almanacByName = new Map<string, (typeof aCrews)[number]>();
      for (const crew of aCrews) {
        const mapped = CREW_ID_TO_AFFILIATION[crew.id];
        if (mapped) almanacByName.set(nameKey(mapped), crew);
      }

      const names = rows.map((r) => pickName(r.name));
      const emblems = await wikiImages(names, 400);
      const used = new Set<string>();

      const crews = rows.map((r): Crew => {
        const name = pickName(r.name);
        const key = nameKey(name);
        const bucket = membership.get(key) ?? { current: [], former: [] };
        const current = [...new Set(bucket.current)].sort((a, b) => b.score - a.score);
        const former = [...new Set(bucket.former)].filter((c) => !current.includes(c)).sort((a, b) => b.score - a.score);
        const a = almanacByName.get(key);
        let slug = slugify(name);
        while (used.has(slug)) slug += '-2';
        used.add(slug);
        return {
          id: r.id,
          slug,
          name,
          category: categorize(name),
          memberCount: Math.max(r.memberCount, current.length + former.length),
          members: current.map((c) => c.id),
          formerMembers: former.map((c) => c.id),
          totalBounty: current.reduce((sum, c) => sum + (c.bounty ?? 0), 0) || parseNumber(a?.total_prime) || 0,
          topImage: current.find((c) => c.image)?.image ?? former.find((c) => c.image)?.image,
          emblem: emblems.get(name),
          yonko: a?.is_yonko || undefined,
          roman: a?.roman_name ?? undefined,
        };
      });

      return crews.sort((a, b) => b.memberCount - a.memberCount || a.name.localeCompare(b.name));
    },
    { isEmpty: (v) => v.length === 0 },
  );
}

export async function getCrew(slug: string) {
  const [crews, characters] = await Promise.all([getCrews(), getCharacters()]);
  const crew = crews.find((c) => c.slug === slug);
  if (!crew) return null;
  const byId = new Map(characters.map((c) => [c.id, c]));
  return {
    crew,
    members: crew.members.map((id) => byId.get(id)!).filter(Boolean),
    former: crew.formerMembers.map((id) => byId.get(id)!).filter(Boolean),
    related: crews.filter((c) => c.category === crew.category && c.slug !== crew.slug).slice(0, 8),
  };
}

/** Find the crew page for an affiliation string on a character record. */
export async function crewHrefMap(): Promise<Map<string, string>> {
  const crews = await getCrews();
  return new Map(crews.map((c) => [nameKey(c.name), `/crews/${c.slug}`]));
}
