import 'server-only';
import { seaRegion, type SeaRegion } from '../curated';
import { almanac, clean } from '../sources/almanac';
import { opapi } from '../sources/onepieceapi';
import { nameKey, parseFirstAppearance, pickJp, pickName, pickRomaji, rng, slugify } from '../util';
import { memo } from './memo';

/* ───────────────────────────── Islands ───────────────────────────── */

export type Island = {
  id: string;
  slug: string;
  name: string;
  jp?: string;
  romaji?: string;
  image?: string;
  sea?: string;
  region?: SeaRegion;
  type?: string;
  population?: string;
  affiliation?: string;
  firstAppearance: { chapter?: number; episode?: number; raw?: string };
};

export function getIslands(): Promise<Island[]> {
  return memo(
    'islands',
    async () => {
      const rows = await opapi.islands();
      if (!rows.length) throw new Error('onepieceapi.com returned no islands');
      const used = new Set<string>();
      return rows
        .map((r) => {
          const name = pickName(r.name);
          let slug = slugify(name);
          while (used.has(slug)) slug += '-2';
          used.add(slug);
          return {
            id: r.id,
            slug,
            name,
            jp: pickJp(r.name),
            romaji: pickRomaji(r.name),
            image: r.image_url ?? undefined,
            sea: r.sea ?? undefined,
            region: seaRegion(r.sea) ?? inferRegion(name),
            type: r.extra_data?.type ?? undefined,
            population: r.extra_data?.population ?? undefined,
            affiliation: r.extra_data?.affiliation ?? undefined,
            firstAppearance: parseFirstAppearance(r.extra_data?.first_appearance),
          } satisfies Island;
        })
        .sort((a, b) => (a.firstAppearance.chapter ?? 9999) - (b.firstAppearance.chapter ?? 9999));
    },
    { isEmpty: (v) => v.length === 0 },
  );
}

function inferRegion(name: string): SeaRegion | undefined {
  if (/rommel/i.test(name)) return 'New World';
  return undefined;
}

/* ─────────────────────────────── Map ─────────────────────────────── */

export const MAP = { w: 1600, h: 1000 } as const;

/** Chart geometry (viewBox units). Story reads left → right. */
const ZONES: Record<SeaRegion, { x: [number, number]; y: [number, number] }> = {
  'East Blue': { x: [90, 700], y: [90, 370] },
  'North Blue': { x: [900, 1510], y: [90, 370] },
  'West Blue': { x: [90, 700], y: [640, 920] },
  'South Blue': { x: [900, 1510], y: [640, 920] },
  Paradise: { x: [90, 740], y: [462, 538] },
  'New World': { x: [860, 1510], y: [462, 538] },
  'Calm Belt': { x: [120, 720], y: [412, 436] },
  'Red Line': { x: [786, 814], y: [180, 820] },
  Sky: { x: [610, 990], y: [96, 168] },
};

/** The Straw Hats' canonical route through the Grand Line. */
const ROUTE = [
  'Reverse Mountain',
  'Cactus Island',
  'Whisky Peak',
  'Little Garden',
  'Drum Island',
  'Alabasta Kingdom',
  'Jaya',
  'Long Ring Long Land',
  'Water 7',
  'Enies Lobby',
  'Thriller Bark',
  'Sabaody Archipelago',
  'Fish-Man Island',
  'Punk Hazard',
  'Dressrosa',
  'Green Bit',
  'Zou',
  'Whole Cake Island',
  'Wano Country',
  'Onigashima',
  'Egghead',
  'Elbaph',
];

const FIXED: Record<string, [number, number]> = {
  'Reverse Mountain': [28, 500],
  'Mary Geoise': [800, 452],
  'Fish-Man Island': [800, 548],
  Marineford: [700, 448],
  'Impel Down': [610, 574],
};

export type MapPoint = {
  key: string;
  name: string;
  slug?: string;
  region: SeaRegion;
  x: number;
  y: number;
  image?: string;
  kind: 'island' | 'place';
  route?: number;
  chapter?: number;
};

export function getWorldMap(): Promise<{ points: MapPoint[]; route: Array<[number, number]> }> {
  return memo('world-map', async () => {
    const [islands, locates] = await Promise.all([getIslands(), almanac.locates()]);
    const points: MapPoint[] = [];
    const taken: Array<[number, number]> = [];
    const routeKeys = ROUTE.map(nameKey);

    const free = (x: number, y: number, d: number) => taken.every(([tx, ty]) => Math.hypot(tx - x, ty - y) > d);
    const place = (key: string, region: SeaRegion, minDist: number): [number, number] => {
      const z = ZONES[region];
      const r = rng(key);
      let best: [number, number] = [0, 0];
      let bestScore = -1;
      for (let i = 0; i < 60; i++) {
        const x = z.x[0] + r() * (z.x[1] - z.x[0]);
        const y = z.y[0] + r() * (z.y[1] - z.y[0]);
        if (free(x, y, minDist)) return [x, y];
        const score = Math.min(...taken.map(([tx, ty]) => Math.hypot(tx - x, ty - y)), 999);
        if (score > bestScore) {
          bestScore = score;
          best = [x, y];
        }
      }
      return best;
    };

    // 1. Route islands, evenly spaced in their half of the Grand Line.
    const onRoute = islands
      .filter((i) => routeKeys.includes(nameKey(i.name)))
      .sort((a, b) => routeKeys.indexOf(nameKey(a.name)) - routeKeys.indexOf(nameKey(b.name)));
    const paradise = onRoute.filter((i) => i.region === 'Paradise' || i.region === undefined);
    const newWorld = onRoute.filter((i) => i.region === 'New World');
    const lay = (list: typeof onRoute, x0: number, x1: number) =>
      list.forEach((island, i) => {
        const t = list.length === 1 ? 0.5 : i / (list.length - 1);
        const x = x0 + t * (x1 - x0);
        const y = 500 + Math.sin(i * 1.15 + 0.6) * 26;
        taken.push([x, y]);
        points.push({
          key: island.id,
          name: island.name,
          slug: island.slug,
          region: island.region ?? 'Paradise',
          x,
          y,
          image: island.image,
          kind: 'island',
          route: routeKeys.indexOf(nameKey(island.name)),
          chapter: island.firstAppearance.chapter,
        });
      });
    lay(paradise, 120, 720);
    lay(newWorld, 880, 1520);

    // 2. Fixed landmarks.
    for (const island of islands) {
      const f = FIXED[island.name];
      if (!f || points.some((p) => p.key === island.id)) continue;
      taken.push(f);
      points.push({
        key: island.id,
        name: island.name,
        slug: island.slug,
        region: island.region ?? 'Red Line',
        x: f[0],
        y: f[1],
        image: island.image,
        kind: 'island',
        route: routeKeys.includes(nameKey(island.name)) ? routeKeys.indexOf(nameKey(island.name)) : undefined,
        chapter: island.firstAppearance.chapter,
      });
    }

    // 3. Everything else, scattered within its sea.
    for (const island of islands) {
      if (points.some((p) => p.key === island.id) || !island.region) continue;
      const [x, y] = place(island.id, island.region, 46);
      taken.push([x, y]);
      points.push({
        key: island.id,
        name: island.name,
        slug: island.slug,
        region: island.region,
        x,
        y,
        image: island.image,
        kind: 'island',
        chapter: island.firstAppearance.chapter,
      });
    }

    // 4. Minor places from api-onepiece.com that aren't already islands.
    const islandKeys = islands.map((i) => nameKey(i.name));
    for (const loc of locates) {
      const name = clean(loc.name).split(' / ')[0];
      const region = seaRegion(loc.sea_name);
      if (!region || !name) continue;
      const k = nameKey(name);
      if (islandKeys.some((ik) => ik.includes(k) || k.includes(ik))) continue;
      if (points.some((p) => nameKey(p.name) === k)) continue;
      const [x, y] = place(`loc-${loc.id}`, region, 30);
      taken.push([x, y]);
      points.push({ key: `loc-${loc.id}`, name, region, x, y, kind: 'place' });
    }

    const route = points
      .filter((p) => p.route !== undefined)
      .sort((a, b) => (a.route ?? 0) - (b.route ?? 0))
      .map((p) => [p.x, p.y] as [number, number]);

    return { points, route };
  });
}

/* ────────────────────────────── Ships ────────────────────────────── */

export type Ship = {
  id: string;
  slug: string;
  name: string;
  jp?: string;
  romaji?: string;
  image?: string;
  status: 'Active' | 'Destroyed' | 'Unknown';
  affiliation?: string;
  firstAppearance: { chapter?: number; episode?: number; raw?: string };
  type?: string;
  captain?: string;
  description?: string;
  length?: string;
  height?: string;
};

export type RegistryBoat = { name: string; type?: string; crew?: string; captain?: string };

const BOAT_ALIASES: Record<string, string> = {
  voguemerry: 'goingmerry',
  peaceofspadil: 'pieceofspadille',
  shiromokubai: 'shiromokubai',
};

const BOAT_TYPES: Record<string, string> = {
  'Navire Restaurant': 'Restaurant ship',
  'Baratie expansion.': 'Restaurant ship',
};

export function getShips(): Promise<{ ships: Ship[]; registry: RegistryBoat[] }> {
  return memo(
    'ships',
    async () => {
      const [rows, boats] = await Promise.all([opapi.ships(), almanac.boats()]);
      const boatByKey = new Map(boats.map((b) => [BOAT_ALIASES[nameKey(b.name)] ?? nameKey(b.name), b]));
      const matched = new Set<string>();
      const used = new Set<string>();

      const ships: Ship[] = rows.map((r) => {
        const name = pickName(r.name);
        const key = nameKey(name);
        const boat = boatByKey.get(key);
        if (boat) matched.add(nameKey(boat.name));
        let slug = slugify(name);
        while (used.has(slug)) slug += '-2';
        used.add(slug);
        const status = r.status === 'Active' || r.status === 'Destroyed' ? r.status : 'Unknown';
        return {
          id: r.id,
          slug,
          name,
          jp: pickJp(r.name),
          romaji: pickRomaji(r.name),
          image: r.image_url ?? undefined,
          status,
          affiliation: r.extra_data?.affiliation ?? undefined,
          firstAppearance: parseFirstAppearance(r.extra_data?.first_appearance),
          type: boat?.type ? BOAT_TYPES[boat.type] ?? boat.type : r.type ?? undefined,
          captain: boat?.character_captain?.name ?? undefined,
          description: clean(boat?.description) || undefined,
          length: r.extra_data?.length ?? undefined,
          height: r.extra_data?.height ?? undefined,
        };
      });

      const registry: RegistryBoat[] = boats
        .filter((b) => !matched.has(nameKey(b.name)))
        .map((b) => ({
          name: clean(b.name),
          type: b.type ? BOAT_TYPES[b.type] ?? clean(b.type) : undefined,
          crew: b.crew ? clean(b.crew.name).replace(/^The /, '').replace(/ crew$/i, ' Pirates') : undefined,
          captain: b.character_captain?.name ? clean(b.character_captain.name) : undefined,
        }));

      const statusOrder = { Active: 0, Unknown: 1, Destroyed: 2 } as const;
      ships.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || (a.firstAppearance.chapter ?? 9999) - (b.firstAppearance.chapter ?? 9999));
      return { ships, registry };
    },
    { isEmpty: (v) => v.ships.length === 0 },
  );
}
