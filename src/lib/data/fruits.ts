import 'server-only';
import { FRUIT_TYPE_FROM_FR } from '../curated';
import { almanac, clean } from '../sources/almanac';
import { opapi, type RawFruit } from '../sources/onepieceapi';
import { wikiImages } from '../sources/wiki';
import { nameKey, pickJp, pickName, pickRomaji, slugify } from '../util';
import { getCharacterIndex } from './characters';
import { memo } from './memo';

export type FruitType = 'Paramecia' | 'Zoan' | 'Ancient Zoan' | 'Mythical Zoan' | 'Logia' | 'SMILE' | 'Artificial' | 'Unknown';

export type Fruit = {
  slug: string;
  name: string; // romanised, e.g. "Gomu Gomu no Mi"
  english?: string; // e.g. "Gum-Gum Fruit"
  jp?: string;
  model?: string;
  type: FruitType;
  description?: string;
  image?: string;
  users: Array<{ name: string; slug?: string; image?: string }>;
};

const GENERIC = /generic-[a-z]+\.webp$/;

function splitModel(roman: string) {
  const [base, ...rest] = roman.split(/,\s*(?:Moderu|Model)\s*:?\s*/i);
  return { base: base.trim(), model: rest.join(' ').trim() || undefined };
}

function cleanFruitText(text: string | null | undefined) {
  return clean(text)
    .replace(/,?\s*also (?:known|called) as [^,.]+ in French,?/gi, ',')
    .replace(/\bin French\b,?/gi, '')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .trim();
}

function opapiType(f: RawFruit): FruitType {
  if (f.type === 'Zoan' && f.sub_type?.startsWith('Mythical')) return 'Mythical Zoan';
  if (f.type === 'Paramecia' || f.type === 'Zoan' || f.type === 'Logia') return f.type;
  return 'Unknown';
}

export function getFruits(): Promise<Fruit[]> {
  return memo(
    'fruits',
    async () => {
      const [aFruits, oFruits, holders, index] = await Promise.all([
        almanac.fruits(),
        opapi.fruits(),
        almanac.characters(),
        getCharacterIndex(),
      ]);

      // Index onepieceapi fruits by romanised base name.
      const oByBase = new Map<string, RawFruit[]>();
      for (const f of oFruits) {
        const roman = pickRomaji(f.name) ?? pickName(f.name);
        const key = nameKey(roman);
        oByBase.set(key, [...(oByBase.get(key) ?? []), f]);
      }
      const usedO = new Set<string>();

      const usersByFruitId = new Map<number, string[]>();
      for (const c of holders) {
        if (c.fruit?.id) usersByFruitId.set(c.fruit.id, [...(usersByFruitId.get(c.fruit.id) ?? []), c.name]);
      }

      const fruits: Omit<Fruit, 'slug'>[] = [];
      for (const a of aFruits) {
        const roman = (a.roman_name || a.name || '').trim();
        if (!roman) continue;
        const { base, model } = splitModel(roman);
        const candidates = (oByBase.get(nameKey(base)) ?? []).filter((f) => !usedO.has(f.id));
        let match: RawFruit | undefined;
        if (candidates.length === 1 && (!model || !candidates[0].model)) match = candidates[0];
        else if (model) {
          const mk = nameKey(model);
          match = candidates.find((f) => {
            const m = f.model && typeof f.model === 'object' ? f.model : null;
            return m && (nameKey(m.en ?? '') === mk || nameKey(m.romaji ?? '') === mk);
          });
        } else match = candidates.find((f) => !f.model);
        if (match) usedO.add(match.id);

        const frType = a.type ? FRUIT_TYPE_FROM_FR[a.type] : undefined;
        const type = (frType as FruitType) ?? (match ? opapiType(match) : 'Unknown');
        const oModel = match?.model && typeof match.model === 'object' ? match.model.en : undefined;
        const image = match?.image_url && !GENERIC.test(match.image_url) ? match.image_url : a.filename || undefined;

        fruits.push({
          name: base + (model ? `, Model: ${model}` : ''),
          english: match ? pickName(match.name) : cleanFruitText(a.name),
          jp: match ? pickJp(match.name) : undefined,
          model: oModel ?? model,
          type,
          description: cleanFruitText(a.description) || undefined,
          image,
          users: (usersByFruitId.get(a.id) ?? []).map((name) => ({ name })),
        });
      }

      // Fruits that only exist in onepieceapi.com.
      for (const f of oFruits) {
        if (usedO.has(f.id)) continue;
        const roman = pickRomaji(f.name) ?? pickName(f.name);
        const model = f.model && typeof f.model === 'object' ? f.model.en ?? undefined : undefined;
        fruits.push({
          name: roman + (model ? `, Model: ${model}` : ''),
          english: pickName(f.name),
          jp: pickJp(f.name),
          model,
          type: opapiType(f),
          image: f.image_url && !GENERIC.test(f.image_url) ? f.image_url : undefined,
          users: [],
        });
      }

      // Link users to character records.
      for (const fruit of fruits) {
        fruit.users = fruit.users.map((u) => {
          const c = index.byKey.get(nameKey(u.name));
          return c ? { name: c.name, slug: c.slug, image: c.image } : u;
        });
      }

      // Wiki art for fruits without a real image.
      const missing = fruits.filter((f) => !f.image).map((f) => f.name.split(',')[0]);
      const art = await wikiImages(missing, 400);
      for (const f of fruits) if (!f.image) f.image = art.get(f.name.split(',')[0]);

      const order: FruitType[] = ['Paramecia', 'Zoan', 'Ancient Zoan', 'Mythical Zoan', 'Logia', 'SMILE', 'Artificial', 'Unknown'];
      fruits.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || b.users.length - a.users.length || a.name.localeCompare(b.name));

      const used = new Set<string>();
      return fruits.map((f) => {
        let slug = slugify(f.name);
        while (used.has(slug)) slug += '-x';
        used.add(slug);
        return { ...f, slug };
      });
    },
    { isEmpty: (v) => v.length === 0 },
  );
}

export async function getFruit(slug: string) {
  const all = await getFruits();
  const index = all.findIndex((f) => f.slug === slug);
  if (index < 0) return null;
  return { fruit: all[index], prev: all[index - 1], next: all[index + 1], all };
}
