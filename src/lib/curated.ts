/**
 * Hand-curated reference data. api-onepiece.com is machine-translated from
 * French, so names for sagas, arcs, haki, etc. are corrected here, and a few
 * editorial touches (roles, kanji, colours) are layered on top of the APIs.
 */

export const STRAW_HATS: Array<{ name: string; role: string; jp: string; dream: string; epithet: string; origin: string }> = [
  { name: 'Monkey D. Luffy', role: 'Captain', jp: 'ルフィ', dream: 'To become King of the Pirates', epithet: '“Straw Hat” Luffy', origin: 'East Blue (Dawn Island)' },
  { name: 'Roronoa Zoro', role: 'Swordsman', jp: 'ゾロ', dream: 'To become the world’s greatest swordsman', epithet: '“Pirate Hunter” Zoro', origin: 'East Blue (Shimotsuki Village)' },
  { name: 'Nami', role: 'Navigator', jp: 'ナミ', dream: 'To draw a map of the entire world', epithet: '“Cat Burglar” Nami', origin: 'East Blue (Cocoyasi Village)' },
  { name: 'Usopp', role: 'Sniper', jp: 'ウソップ', dream: 'To become a brave warrior of the sea', epithet: '“God” Usopp', origin: 'East Blue (Syrup Village)' },
  { name: 'Sanji', role: 'Cook', jp: 'サンジ', dream: 'To find the All Blue', epithet: '“Black Leg” Sanji', origin: 'North Blue (Germa Kingdom)' },
  { name: 'Tony Tony Chopper', role: 'Doctor', jp: 'チョッパー', dream: 'To become a doctor who can cure any disease', epithet: '“Cotton Candy Lover” Chopper', origin: 'Grand Line (Drum Island)' },
  { name: 'Nico Robin', role: 'Archaeologist', jp: 'ロビン', dream: 'To uncover the True History', epithet: '“Devil Child” Nico Robin', origin: 'West Blue (Ohara)' },
  { name: 'Franky', role: 'Shipwright', jp: 'フランキー', dream: 'To build a dream ship that sails to the end of the world', epithet: '“Iron Man” Franky', origin: 'South Blue' },
  { name: 'Brook', role: 'Musician', jp: 'ブルック', dream: 'To reunite with Laboon', epithet: '“Soul King” Brook', origin: 'West Blue' },
  { name: 'Jinbe', role: 'Helmsman', jp: 'ジンベエ', dream: 'To follow his captain to the end', epithet: '“Knight of the Sea” Jinbe', origin: 'Grand Line (Fish-Man Island)' },
];

export const SAGAS: Record<number, { name: string; jp: string; chapters: string; episodes: string; volumes: string; tone: string }> = {
  1: { name: 'East Blue', jp: '東の海', chapters: '1–100', episodes: '1–61', volumes: '1–12', tone: '#1b5fa8' },
  2: { name: 'Arabasta', jp: 'アラバスタ', chapters: '101–216', episodes: '62–135', volumes: '12–23', tone: '#c98a2b' },
  3: { name: 'Sky Island', jp: '空島', chapters: '217–302', episodes: '136–206', volumes: '24–32', tone: '#3fa7d6' },
  4: { name: 'Water 7', jp: 'ウォーターセブン', chapters: '303–441', episodes: '207–325', volumes: '32–46', tone: '#2b7a78' },
  5: { name: 'Thriller Bark', jp: 'スリラーバーク', chapters: '442–489', episodes: '326–384', volumes: '46–50', tone: '#5b3f7a' },
  6: { name: 'Summit War', jp: '頂上戦争', chapters: '490–597', episodes: '385–516', volumes: '50–61', tone: '#b3261e' },
  7: { name: 'Fish-Man Island', jp: '魚人島', chapters: '598–653', episodes: '517–574', volumes: '61–66', tone: '#1f8a9e' },
  8: { name: 'Dressrosa', jp: 'ドレスローザ', chapters: '654–801', episodes: '579–746', volumes: '66–80', tone: '#d94f70' },
  9: { name: 'Four Emperors', jp: '四皇', chapters: '802–1057', episodes: '747–1085', volumes: '80–105', tone: '#8a2be2' },
  10: { name: 'Final', jp: '最終章', chapters: '1058–', episodes: '1086–', volumes: '105–', tone: '#111010' },
};

export const ARCS: Record<number, { name: string; filler?: boolean; special?: boolean; wiki: string }> = {
  1: { name: 'Romance Dawn', wiki: 'Romance Dawn Arc' },
  2: { name: 'Orange Town', wiki: 'Orange Town Arc' },
  3: { name: 'Syrup Village', wiki: 'Syrup Village Arc' },
  4: { name: 'Baratie', wiki: 'Baratie Arc' },
  5: { name: 'Arlong Park', wiki: 'Arlong Park Arc' },
  6: { name: 'Buggy’s Crew Adventures', special: true, wiki: "Buggy's Crew Adventure Chronicles" },
  7: { name: 'Loguetown', wiki: 'Loguetown Arc' },
  8: { name: 'Warship Island', filler: true, wiki: 'Warship Island Arc' },
  9: { name: 'Reverse Mountain', wiki: 'Reverse Mountain Arc' },
  10: { name: 'Whisky Peak', wiki: 'Whisky Peak Arc' },
  11: { name: 'Koby & Helmeppo', special: true, wiki: 'Coby and Helmeppo Arc' },
  12: { name: 'Little Garden', wiki: 'Little Garden Arc' },
  13: { name: 'Drum Island', wiki: 'Drum Island Arc' },
  14: { name: 'Arabasta', wiki: 'Arabasta Arc' },
  15: { name: 'Post-Arabasta', filler: true, wiki: 'Post-Arabasta Arc' },
  16: { name: 'Goat Island', filler: true, wiki: 'Goat Island Arc' },
  17: { name: 'Ruluka Island', filler: true, wiki: 'Ruluka Island Arc' },
  18: { name: 'Jaya', wiki: 'Jaya Arc' },
  19: { name: 'Skypiea', wiki: 'Skypiea Arc' },
  20: { name: 'G-8', filler: true, wiki: 'G-8 Arc' },
  21: { name: 'Long Ring Long Land', wiki: 'Long Ring Long Land Arc' },
  22: { name: 'Ocean’s Dream', filler: true, wiki: "Ocean's Dream Arc" },
  23: { name: 'Foxy’s Return', filler: true, wiki: "Foxy's Return Arc" },
  24: { name: 'Water 7', wiki: 'Water 7 Arc' },
  25: { name: 'Enies Lobby', wiki: 'Enies Lobby Arc' },
  26: { name: 'Post-Enies Lobby', wiki: 'Post-Enies Lobby Arc' },
  27: { name: 'Ice Hunter', filler: true, wiki: 'Ice Hunter Arc' },
  28: { name: 'Thriller Bark', wiki: 'Thriller Bark Arc' },
  29: { name: 'Spa Island', filler: true, wiki: 'Spa Island Arc' },
  30: { name: 'Sabaody Archipelago', wiki: 'Sabaody Archipelago Arc' },
  31: { name: 'Amazon Lily', wiki: 'Amazon Lily Arc' },
  32: { name: 'Impel Down', wiki: 'Impel Down Arc' },
  33: { name: 'Little East Blue', filler: true, wiki: 'Little East Blue Arc' },
  34: { name: 'Marineford', wiki: 'Marineford Arc' },
  35: { name: 'Post-War', wiki: 'Post-War Arc' },
  36: { name: 'Return to Sabaody', wiki: 'Return to Sabaody Arc' },
  37: { name: 'Fish-Man Island', wiki: 'Fish-Man Island Arc' },
  38: { name: 'Z’s Ambition', filler: true, wiki: "Z's Ambition Arc" },
  39: { name: 'Punk Hazard', wiki: 'Punk Hazard Arc' },
  40: { name: 'Caesar Retrieval', filler: true, wiki: 'Caesar Retrieval Arc' },
  41: { name: 'Dressrosa', wiki: 'Dressrosa Arc' },
  42: { name: 'Silver Mine', filler: true, wiki: 'Silver Mine Arc' },
  43: { name: 'Zou', wiki: 'Zou Arc' },
  44: { name: 'Marine Rookie', filler: true, wiki: 'Marine Rookie Arc' },
  45: { name: 'Whole Cake Island', wiki: 'Whole Cake Island Arc' },
  46: { name: 'Levely', wiki: 'Levely Arc' },
  47: { name: 'Wano Country', wiki: 'Wano Country Arc' },
  48: { name: 'Cidre Guild', filler: true, wiki: 'Cidre Guild Arc' },
  49: { name: 'Egghead', wiki: 'Egghead Arc' },
  50: { name: 'Elbaph', wiki: 'Elbaph Arc' },
};

export const HAKI: Record<number, { name: string; kanji: string; romaji: string; gist: string }> = {
  1: { name: 'Observation Haki', kanji: '見聞色', romaji: 'Kenbunshoku', gist: 'Sense the unseen. Read intent before it becomes motion.' },
  2: { name: 'Armament Haki', kanji: '武装色', romaji: 'Busōshoku', gist: 'Spirit as armour. The only sure way to strike a Logia.' },
  3: { name: 'Conqueror’s Haki', kanji: '覇王色', romaji: 'Haōshoku', gist: 'The will of a king. One in a million is born with it.' },
};

export const SWORD_GRADES: Record<string, { name: string; jp: string; rank: number }> = {
  'Saijo Ô Wazamono': { name: 'Supreme Grade', jp: '最上大業物', rank: 1 },
  'Ô Wazamono': { name: 'Great Grade', jp: '大業物', rank: 2 },
  'Ryo Wazamono': { name: 'Skillful Grade', jp: '良業物', rank: 3 },
  '': { name: 'Ungraded', jp: '無銘', rank: 4 },
};

/** Map api-onepiece.com crew ids to onepieceapi.com affiliation names. */
export const CREW_ID_TO_AFFILIATION: Record<number, string> = {
  1: 'Straw Hat Pirates',
  2: 'Red Hair Pirates',
  3: 'Alvida Pirates',
  4: 'Buggy Pirates',
  5: 'Roger Pirates',
  7: 'Black Cat Pirates',
  8: 'Krieg Pirates',
  10: 'Arlong Pirates',
  16: 'Whitebeard Pirates',
  21: 'Donquixote Pirates',
  22: 'Blackbeard Pirates',
  24: 'Foxy Pirates',
  26: 'Sun Pirates',
  28: 'Thriller Bark Pirates',
  32: 'Heart Pirates',
  33: 'Kid Pirates',
  34: 'Hawkins Pirates',
  35: 'Drake Pirates',
  36: 'On Air Pirates',
  37: 'Bonney Pirates',
  38: 'Fire Tank Pirates',
  41: 'Kuja Pirates',
  42: 'Spade Pirates',
  44: 'Beasts Pirates',
  49: 'Caribou Pirates',
  50: 'New Fish-Man Pirates',
  53: 'Big Mom Pirates',
  56: 'Barto Club',
  62: 'Rocks Pirates',
  78: 'Baroque Works',
  82: 'Marines',
  87: 'Straw Hat Grand Fleet',
  90: 'Cipher Pol',
  130: 'Revolutionary Army',
};

export const FRUIT_TYPES: Record<string, { label: string; jp: string; blurb: string }> = {
  Paramecia: { label: 'Paramecia', jp: '超人系', blurb: 'Superhuman. Alters the body, the world around it, or both — the widest and strangest family.' },
  Zoan: { label: 'Zoan', jp: '動物系', blurb: 'Animal. Grants a hybrid and full beast form, with the stamina to match.' },
  'Ancient Zoan': { label: 'Ancient Zoan', jp: '動物系 古代種', blurb: 'Prehistoric beasts. Monstrous durability, dinosaur-scale power.' },
  'Mythical Zoan': { label: 'Mythical Zoan', jp: '動物系 幻獣種', blurb: 'Creatures of legend. Rarer than Logia, with powers beyond the animal.' },
  Logia: { label: 'Logia', jp: '自然系', blurb: 'Nature. Become an element; blades and bullets pass straight through.' },
  SMILE: { label: 'SMILE', jp: 'スマイル', blurb: 'Artificial Zoan made from SAD. A one-in-ten gamble that steals your frown forever.' },
  Artificial: { label: 'Artificial', jp: '人造', blurb: 'Man-made fruits engineered by Vegapunk’s research.' },
  Unknown: { label: 'Unclassified', jp: '不明', blurb: 'Type undisclosed in the records.' },
};

export const FRUIT_TYPE_FROM_FR: Record<string, string> = {
  Paramecia: 'Paramecia',
  Zoan: 'Zoan',
  Logia: 'Logia',
  'Zoan Mythique': 'Mythical Zoan',
  'Zoan Antique': 'Ancient Zoan',
  Smile: 'SMILE',
  Clone: 'Artificial',
};

/** Normalise free-form sea names from both APIs into map regions. */
export type SeaRegion = 'East Blue' | 'West Blue' | 'North Blue' | 'South Blue' | 'Paradise' | 'New World' | 'Sky' | 'Calm Belt' | 'Red Line';

export function seaRegion(raw: string | null | undefined): SeaRegion | undefined {
  if (!raw) return undefined;
  const s = raw.toLowerCase();
  if (s.includes('east blue') || s.includes('dawn island') || s.includes('gecko') || s.includes('organ')) return 'East Blue';
  if (s.includes('west blue')) return 'West Blue';
  if (s.includes('north blue')) return 'North Blue';
  if (s.includes('south blue')) return 'South Blue';
  if (s.includes('sky') || s.includes('mer blanche')) return 'Sky';
  if (s.includes('calm belt')) return 'Calm Belt';
  if (s.includes('under the red line') || s.includes('red line')) return 'Red Line';
  if (s.includes('new world') || s.includes('nouveau monde') || s.includes('wano')) return 'New World';
  if (s.includes('paradise') || s.includes('paradis') || s.includes('jaya') || s.includes('cactus') || s.includes('grand line')) return 'Paradise';
  return undefined;
}

export const SEA_INFO: Record<SeaRegion, { jp: string; blurb: string }> = {
  'East Blue': { jp: '東の海', blurb: 'The weakest sea — and the cradle of the Pirate King.' },
  'West Blue': { jp: '西の海', blurb: 'Home of mafia families and the scholars of Ohara.' },
  'North Blue': { jp: '北の海', blurb: 'Cold waters of the Germa and the Donquixote.' },
  'South Blue': { jp: '南の海', blurb: 'Where Roger’s son was born under a false name.' },
  Paradise: { jp: '楽園', blurb: 'The first half of the Grand Line. Its name is a sneer.' },
  'New World': { jp: '新世界', blurb: 'Beyond the Red Line, where Emperors rule the waves.' },
  Sky: { jp: '空島', blurb: 'Islands of cloud, ten thousand metres overhead.' },
  'Calm Belt': { jp: '凪の帯', blurb: 'Windless waters teeming with Sea Kings.' },
  'Red Line': { jp: '赤い土の大陸', blurb: 'The continent that rings the world.' },
};

/** Section catalogue used by the menu, contents index and footer. */
export const SECTIONS = [
  { href: '/characters', no: '01', title: 'The Cast', jp: '登場人物', blurb: 'Every pirate, marine and stowaway on record.' },
  { href: '/bounties', no: '02', title: 'Most Wanted', jp: '手配書', blurb: 'The highest prices on the sea.' },
  { href: '/devil-fruits', no: '03', title: 'Devil Fruits', jp: '悪魔の実', blurb: 'Eat one. Lose the sea forever.' },
  { href: '/world', no: '04', title: 'World Chart', jp: '世界地図', blurb: 'The four Blues, the Grand Line and the clouds.' },
  { href: '/ships', no: '05', title: 'Shipyard', jp: '造船所', blurb: 'Every hull that carried a dream.' },
  { href: '/crews', no: '06', title: 'Factions', jp: '勢力図', blurb: 'Crews, navies, kingdoms and cults.' },
  { href: '/voyage', no: '07', title: 'The Voyage', jp: '航海日誌', blurb: 'Ten sagas, fifty arcs, over a thousand episodes.' },
  { href: '/library', no: '08', title: 'Library', jp: '単行本', blurb: 'Every volume, every chapter.' },
  { href: '/arsenal', no: '09', title: 'Arsenal', jp: '覇気と武器', blurb: 'Haki, gears, legendary blades and dials.' },
] as const;

const S = 'https://hlryizauzapedkefdviw.supabase.co/storage/v1/object/public';
export const SECTION_ART: Record<string, string> = {
  '/characters': `${S}/characters/monkey-d-luffy.webp`,
  '/bounties': `${S}/characters/edward-newgate.webp`,
  '/devil-fruits': 'https://images.api-onepiece.com/fruits/5665e89442022d4c0e7684c650dc6d6b.png',
  '/world': `${S}/islands/wano-country.webp`,
  '/ships': `${S}/ships/thousand-sunny.webp`,
  '/crews': `${S}/characters/shanks.webp`,
  '/voyage': `${S}/islands/water-7.webp`,
  '/library': `${S}/characters/nico-robin.webp`,
  '/arsenal': `${S}/characters/roronoa-zoro.webp`,
};
