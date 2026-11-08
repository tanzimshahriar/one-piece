import 'server-only';
import { opapi } from '../sources/onepieceapi';
import { pickJp, pickName } from '../util';
import { getCharacterIndex, type Status } from './characters';
import { memo } from './memo';

export type Wanted = {
  rank: number;
  characterId: string;
  href: string;
  name: string;
  jp?: string;
  image?: string;
  status: Status;
  amount: number;
  previous: number[];
  epithet?: string;
  affiliation?: string;
};

export function getWanted(): Promise<Wanted[]> {
  return memo(
    'wanted',
    async () => {
      const [rows, index] = await Promise.all([opapi.bounties(), getCharacterIndex()]);
      const byCharacter = new Map<string, Wanted>();

      for (const row of rows) {
        if (!row.is_active || !row.amount || !row.character_id) continue;
        const existing = byCharacter.get(row.character_id);
        if (existing && existing.amount >= row.amount) continue;
        const c = index.byId.get(row.character_id);
        const status = (c?.status ?? row.characters?.status ?? 'Unknown') as Status;
        byCharacter.set(row.character_id, {
          rank: 0,
          characterId: row.character_id,
          href: `/characters/${c?.slug ?? row.character_id}`,
          name: c?.name ?? pickName(row.characters?.name),
          jp: c?.jp ?? pickJp(row.characters?.name),
          image: c?.image ?? row.characters?.image_url ?? undefined,
          status: status === 'Alive' || status === 'Deceased' ? status : 'Unknown',
          amount: row.amount,
          previous: c?.bountyHistory.slice(0, -1) ?? [],
          epithet: c?.epithet,
          affiliation: c?.affiliations[0],
        });
      }

      // Characters whose bounty is only on their own record.
      for (const c of index.all) {
        if (c.bounty && !byCharacter.has(c.id)) {
          byCharacter.set(c.id, {
            rank: 0,
            characterId: c.id,
            href: `/characters/${c.slug}`,
            name: c.name,
            jp: c.jp,
            image: c.image,
            status: c.status,
            amount: c.bounty,
            previous: c.bountyHistory.slice(0, -1),
            epithet: c.epithet,
            affiliation: c.affiliations[0],
          });
        }
      }

      return [...byCharacter.values()]
        .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name))
        .map((w, i) => ({ ...w, rank: i + 1 }));
    },
    { isEmpty: (v) => v.length === 0 },
  );
}
