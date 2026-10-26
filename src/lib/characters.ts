export const CHARACTERS_PER_PAGE = 10;

const MAIN_CHARACTER_SEARCHES = [
  'Luffy',
  'Zoro',
  'Nami',
  'Usopp',
  'Sanji',
  'Chopper',
  'Nico Robin',
  'Franky',
  'Brook',
  'Jinbe',
];

type LocalizedText = {
  en?: string | null;
  romaji?: string | null;
  jp?: string | null;
};

export type Character = {
  id: string;
  name: LocalizedText | string | null;
  age: number | null;
  height: number | null;
  blood_type: string;
  status: string | null;
  image_url: string | null;
  extra_data: Record<string, unknown> | null;
  bounties: Array<{
    id: string;
    amount: number | null;
    is_active: boolean;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return isRecord(value) &&
    ['en', 'romaji', 'jp'].every(
      (field) => !(field in value) || value[field] === null || typeof value[field] === 'string',
    );
}

export function isCharacter(value: unknown): value is Character {
  if (!isRecord(value) || typeof value.id !== 'string') return false;
  if (value.image_url !== null && typeof value.image_url !== 'string') return false;
  if (
    value.name !== null &&
    typeof value.name !== 'string' &&
    !isLocalizedText(value.name)
  ) return false;
  if (value.age !== null && typeof value.age !== 'number') return false;
  if (value.height !== null && typeof value.height !== 'number') return false;
  if (typeof value.blood_type !== 'string') return false;
  if (value.status !== null && typeof value.status !== 'string') return false;
  if (value.extra_data !== null && !isRecord(value.extra_data)) return false;
  if (!Array.isArray(value.bounties)) return false;

  return value.bounties.every(
    (bounty) =>
      isRecord(bounty) &&
      typeof bounty.id === 'string' &&
      (bounty.amount === null || typeof bounty.amount === 'number') &&
      typeof bounty.is_active === 'boolean',
  );
}

export function getCharacterName(name: Character['name'], id: string): string {
  if (typeof name === 'string') return name;
  if (name) return name.en || name.romaji || name.jp || `Unknown character ${id}`;
  return `Unknown character ${id}`;
}

export function getCharacterExtra(character: Character, field: string): string | undefined {
  const value = character.extra_data?.[field];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function getActiveBounty(character: Character): number | null {
  const activeBounty = character.bounties.find((bounty) => bounty.is_active && bounty.amount !== null);
  return activeBounty?.amount ?? null;
}

async function fetchCharacterPage(page: number, query?: string): Promise<Character[]> {
  const url = new URL('https://onepieceapi.com/api/characters');
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(CHARACTERS_PER_PAGE));
  if (query) url.searchParams.set('q', query);

  const response = await fetch(url, { next: { revalidate: 60 } });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error === 'string'
      ? payload.error
      : `The character API returned HTTP ${response.status}.`;
    throw new Error(message);
  }

  if (!Array.isArray(payload) || !payload.every(isCharacter)) {
    throw new Error('The character API returned data in an unexpected format.');
  }

  return payload;
}

export async function fetchMainCharacters(): Promise<Character[]> {
  const results = await Promise.all(
    MAIN_CHARACTER_SEARCHES.map(async (query) => {
      const characters = await fetchCharacterPage(1, query);
      const queryName = query.toLocaleLowerCase();
      const match = characters.find((character) =>
        getCharacterName(character.name, character.id).toLocaleLowerCase().includes(queryName),
      );

      if (!match) {
        throw new Error(`The character API did not find a matching record for "${query}".`);
      }

      return match;
    }),
  );

  return Array.from(new Map(results.map((character) => [character.id, character])).values());
}

export async function fetchCharacters(page: number, query?: string): Promise<Character[]> {
  if (query?.trim()) return fetchCharacterPage(page, query.trim());
  if (page === 1) return fetchMainCharacters();

  return fetchCharacterPage(page - 1);
}
