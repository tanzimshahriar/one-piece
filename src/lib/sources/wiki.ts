import 'server-only';

/**
 * One Piece Wiki (Fandom, CC-BY-SA). Used to enrich API records with page
 * images (portraits, Jolly Rogers, covers) and lead paragraphs. Every call is
 * best-effort: failures resolve to empty results so pages still render.
 */

const API = 'https://onepiece.fandom.com/api.php';
const REVALIDATE = 60 * 60 * 24 * 7;

type QueryResponse = {
  query?: {
    normalized?: Array<{ from: string; to: string }>;
    redirects?: Array<{ from: string; to: string }>;
    pages?: Array<{ title: string; missing?: boolean; thumbnail?: { source: string; width: number; height: number } }>;
  };
};

async function wikiFetch<T>(params: Record<string, string>): Promise<T | null> {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...params })) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE, tags: ['wiki'] },
      headers: { 'User-Agent': 'GrandLineAlmanac/1.0 (fan-made One Piece encyclopedia)' },
    });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('json')) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Resolve page images for many titles at once (50 per request). */
export async function wikiImages(titles: string[], width = 600): Promise<Map<string, string>> {
  const unique = [...new Set(titles.filter(Boolean))].sort();
  const result = new Map<string, string>();
  const batches: string[][] = [];
  for (let i = 0; i < unique.length; i += 50) batches.push(unique.slice(i, i + 50));

  await Promise.all(
    batches.map(async (batch) => {
      const data = await wikiFetch<QueryResponse>({
        action: 'query',
        prop: 'pageimages',
        titles: batch.join('|'),
        redirects: '1',
        pithumbsize: String(width),
        pilimit: '50',
      });
      const q = data?.query;
      if (!q?.pages) return;
      const normalized = new Map(q.normalized?.map((n) => [n.from, n.to]) ?? []);
      const redirects = new Map(q.redirects?.map((r) => [r.from, r.to]) ?? []);
      const pages = new Map(q.pages.map((p) => [p.title, p]));
      for (const title of batch) {
        const n = normalized.get(title) ?? title;
        const r = redirects.get(n) ?? n;
        const src = pages.get(r)?.thumbnail?.source;
        if (src) result.set(title, src);
      }
    }),
  );
  return result;
}

export async function wikiImage(title: string, width = 800): Promise<string | undefined> {
  return (await wikiImages([title], width)).get(title);
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' };

function decode(text: string) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

export type WikiIntro = { title: string; url: string; paragraphs: string[] };

/** Lead section paragraphs of a wiki article, plain text. */
export async function wikiIntro(title: string, maxParagraphs = 4): Promise<WikiIntro | null> {
  const data = await wikiFetch<{ parse?: { title: string; text: string } }>({
    action: 'parse',
    page: title,
    prop: 'text',
    section: '0',
    redirects: '1',
    disablelimitreport: '1',
    disableeditsection: '1',
    disabletoc: '1',
  });
  const html = data?.parse?.text;
  if (!html) return null;

  const stripped = html
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<table[\s\S]*?<\/table>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<sup[\s\S]*?<\/sup>/gi, '')
    .replace(/<div[^>]*class="[^"]*(?:hatnote|notice|dablink|mw-references)[^"]*"[\s\S]*?<\/div>/gi, '');

  const paragraphs: string[] = [];
  for (const match of stripped.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = decode(match[1].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:])/g, '$1')
      .trim();
    if (text.length < 40) continue;
    if (/^(this article|for the|not to be confused|redirects here)/i.test(text)) continue;
    paragraphs.push(text);
    if (paragraphs.length >= maxParagraphs) break;
  }
  if (!paragraphs.length) return null;
  const resolved = data!.parse!.title;
  return { title: resolved, url: `https://onepiece.fandom.com/wiki/${encodeURIComponent(resolved.replace(/ /g, '_'))}`, paragraphs };
}
