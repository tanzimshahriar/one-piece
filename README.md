# Grand Line — The One Piece Almanac

An illustrated, fan-made encyclopedia of _One Piece_, designed like a manga page: ink on newsprint, screentone halftones, concentration lines, wanted-poster parchment and hand-drawn nautical charts.

## Sections

| Route | What's there |
| --- | --- |
| `/` | WebGL halftone-sea hero, Straw Hat manga spread, pinned "Most Wanted" poster rail, saga strip, contents index |
| `/characters`, `/characters/[slug]` | 1,400+ characters — search, filter (status, sea, debut saga, bounty, crew), sort; dossiers with bounty history charts, wiki biographies, Devil Fruit, crewmates |
| `/bounties` | Poster wall and log-scale ledger of every active bounty |
| `/devil-fruits`, `/devil-fruits/[slug]` | 240 fruits merged from two APIs, procedurally drawn fruit glyphs where no art exists, users |
| `/world`, `/world/[slug]` | Interactive chart of the four Blues, the Grand Line, the Red Line and sky islands, with the Straw Hats' route |
| `/ships`, `/ships/[slug]` | Shipyard and harbour registry |
| `/crews`, `/crews/[slug]` | Bubble-pack chart of factions with Jolly Rogers, rosters, fleets, combined bounties |
| `/voyage`, `/voyage/[arc]` | 10 sagas, 50 arcs (filler flagged), full episode guides |
| `/library`, `/library/[volume]` | Every tankōbon on a shelf, covers, chapter lists |
| `/arsenal` | Haki, Luffy's Gears and techniques, graded swords, dials |

Press <kbd>⌘K</kbd> or <kbd>/</kbd> anywhere for the Den Den Mushi search.

## Data sources

All free, no keys:

- **[onepieceapi.com](https://onepieceapi.com)** — characters, bounties, devil fruits, ships, islands, affiliations.
- **[api-onepiece.com](https://api-onepiece.com)** — sagas, arcs, episodes, chapters, volumes, crews, haki, swords, dials, Luffy's gears & techniques. Its English text is machine-translated from French, so it is cleaned on ingest (`src/lib/sources/almanac.ts`) and arc/saga names are curated (`src/lib/curated.ts`).
- **[One Piece Wiki](https://onepiece.fandom.com)** (CC BY-SA) — page images (portraits for records without art, Jolly Rogers, arc art, volume covers, episode stills) and lead-section biographies.
- **[AniList](https://anilist.co)** — fallback character biographies.

Upstream quirks handled in code:

- onepieceapi.com paginates over a non-unique sort key, so pages overlap and drop rows. The client unions several page sizes (`100, 91, 83`) to recover ~99.5% of records.
- ~5% of character records (mostly major characters) have empty `extra_data`; affiliations and jobs are backfilled from api-onepiece.com's roster.
- Episode and volume numbers upstream contain typos ("11++", duplicates); ids are used as the source of truth when they disagree.

## Architecture

- **Next.js 14 App Router**, React Server Components, ISR (`revalidate`) on every page; detail pages pre-render the most-visited records and generate the rest on demand.
- `src/lib/sources/*` — thin, typed fetchers (Next data cache, best-effort, never throw).
- `src/lib/data/*` — merged domain models, memoised per server instance. Core datasets throw when empty so ISR keeps serving the last good page instead of caching an empty one.
- `src/components/art/*` — hand-built SVG art (straw hat, devil fruit generator, katana, compass, concentration lines) and the WebGL `HalftoneSea` shader.
- Motion: [`motion`](https://motion.dev) for reveals and scroll-linked effects, [`lenis`](https://github.com/darkroomengineering/lenis) for smooth scrolling, a halftone-dot page transition (`src/app/template.tsx`). Everything respects `prefers-reduced-motion`.
- Type: Dela Gothic One (display + Japanese), Playfair Display, Zen Kaku Gothic New, JetBrains Mono.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # pre-renders ~250 pages from the live APIs
```

---

ONE PIECE © Eiichiro Oda / Shueisha, Toei Animation. Unofficial, non-commercial fan project; data and images belong to their respective owners.
