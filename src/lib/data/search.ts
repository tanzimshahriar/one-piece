import 'server-only';
import { almanac } from '../sources/almanac';
import { nameKey, fmt } from '../util';
import { getWanted } from './bounties';
import { getCharacters } from './characters';
import { getCrews } from './crews';
import { getFruits } from './fruits';
import { getLibrary } from './library';
import { memo } from './memo';
import { getVoyage } from './voyage';
import { getIslands, getShips } from './world';

export type SearchHit = {
  kind: 'Character' | 'Devil Fruit' | 'Island' | 'Ship' | 'Faction' | 'Arc';
  title: string;
  sub?: string;
  href: string;
  image?: string;
  keys: string[];
  weight: number;
};

export function getSearchIndex(): Promise<SearchHit[]> {
  return memo('search-index', async () => {
    const [characters, fruits, islands, ships, crews, sagas] = await Promise.all([
      getCharacters(),
      getFruits(),
      getIslands(),
      getShips(),
      getCrews(),
      getVoyage(),
    ]);
    const hits: SearchHit[] = [];
    for (const c of characters)
      hits.push({
        kind: 'Character',
        title: c.name,
        sub: c.epithet ?? c.strawHat?.role ?? c.occupations[0] ?? c.affiliations[0],
        href: `/characters/${c.slug}`,
        image: c.image,
        keys: [c.name, c.jp ?? '', c.romaji ?? '', c.epithet ?? ''].map((k) => k.toLowerCase()),
        weight: c.score,
      });
    for (const f of fruits)
      hits.push({
        kind: 'Devil Fruit',
        title: f.name,
        sub: [f.english, f.type].filter(Boolean).join(' · '),
        href: `/devil-fruits/${f.slug}`,
        image: f.image,
        keys: [f.name, f.english ?? '', f.jp ?? '', ...f.users.map((u) => u.name)].map((k) => k.toLowerCase()),
        weight: 6 + f.users.length,
      });
    for (const i of islands)
      hits.push({ kind: 'Island', title: i.name, sub: i.sea, href: `/world/${i.slug}`, image: i.image, keys: [i.name.toLowerCase(), i.jp ?? ''], weight: 6 });
    for (const s of ships.ships)
      hits.push({ kind: 'Ship', title: s.name, sub: s.affiliation, href: `/ships/${s.slug}`, image: s.image, keys: [s.name.toLowerCase(), s.jp ?? ''], weight: 6 });
    for (const c of crews)
      hits.push({
        kind: 'Faction',
        title: c.name,
        sub: `${c.memberCount} members`,
        href: `/crews/${c.slug}`,
        image: c.emblem ?? c.topImage,
        keys: [c.name.toLowerCase(), (c.roman ?? '').toLowerCase()],
        weight: 5 + Math.log2(c.memberCount + 1),
      });
    for (const s of sagas)
      for (const a of s.arcs)
        hits.push({
          kind: 'Arc',
          title: `${a.name} Arc`,
          sub: `${s.name} Saga${a.episodes ? ` · Ep. ${a.episodes.from}–${a.episodes.to}` : ''}`,
          href: `/voyage/${a.slug}`,
          image: a.image,
          keys: [a.name.toLowerCase()],
          weight: 7,
        });
    return hits;
  });
}

export async function search(query: string, limit = 24) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const qk = nameKey(q);
  const index = await getSearchIndex();
  const scored: Array<{ hit: SearchHit; score: number }> = [];
  for (const hit of index) {
    let score = 0;
    for (const key of hit.keys) {
      if (!key) continue;
      if (key === q) score = Math.max(score, 100);
      else if (key.startsWith(q)) score = Math.max(score, 60);
      else if (key.split(/[\s.\-“”"]+/).some((w) => w.startsWith(q))) score = Math.max(score, 45);
      else if (key.includes(q)) score = Math.max(score, 25);
      else if (qk.length > 2 && nameKey(key).includes(qk)) score = Math.max(score, 20);
    }
    if (score) scored.push({ hit, score: score + hit.weight });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ hit }) => ({ kind: hit.kind, title: hit.title, sub: hit.sub, href: hit.href, image: hit.image }));
}

export function getStats() {
  return memo('stats', async () => {
    const [characters, fruits, islands, ships, crews, wanted, volumes, episodes, chapters] = await Promise.all([
      getCharacters(),
      getFruits(),
      getIslands(),
      getShips(),
      getCrews(),
      getWanted(),
      getLibrary(),
      almanac.episodeCount(),
      almanac.chapterCount(),
    ]);
    const totalBounty = wanted.reduce((s, w) => s + w.amount, 0);
    return {
      characters: characters.length,
      fruits: fruits.length,
      islands: islands.length,
      ships: ships.ships.length + ships.registry.length,
      crews: crews.length,
      wanted: wanted.length,
      totalBounty,
      totalBountyLabel: fmt(totalBounty),
      volumes: volumes.length,
      episodes: typeof episodes === 'number' ? episodes : 1180,
      chapters: typeof chapters === 'number' ? chapters : 1197,
    };
  });
}
