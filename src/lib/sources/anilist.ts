import 'server-only';

/** AniList GraphQL — fallback character biographies when the wiki is unreachable. */

const ONE_PIECE_MEDIA = new Set([21, 30013]);

type AniCharacter = {
  name: { full: string; native: string | null };
  description: string | null;
  siteUrl: string;
  media: { nodes: Array<{ id: number }> };
};

export type AniBio = { url: string; paragraphs: string[]; spoilers: string[] };

export async function aniListBio(name: string): Promise<AniBio | null> {
  const query = `query ($search: String) {
    Page(perPage: 6) {
      characters(search: $search) {
        name { full native }
        description(asHtml: false)
        siteUrl
        media(perPage: 25) { nodes { id } }
      }
    }
  }`;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables: { search: name } }),
      next: { revalidate: 60 * 60 * 24 * 7, tags: ['anilist'] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { Page?: { characters?: AniCharacter[] } } };
    const match = json.data?.Page?.characters?.find(
      (c) => c.description && c.media.nodes.some((m) => ONE_PIECE_MEDIA.has(m.id)),
    );
    if (!match?.description) return null;

    const spoilers: string[] = [];
    const text = match.description
      .replace(/~!([\s\S]*?)!~/g, (_, s: string) => {
        spoilers.push(s.trim());
        return '';
      })
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^__[^_]+:__.*$/gm, '')
      .replace(/__|\*\*/g, '')
      .replace(/<[^>]+>/g, '');

    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter((p) => p.length > 40)
      .slice(0, 4);
    if (!paragraphs.length) return null;
    return { url: match.siteUrl, paragraphs, spoilers: spoilers.filter((s) => s.length > 20).slice(0, 2) };
  } catch {
    return null;
  }
}
