import type { CSSProperties } from 'react';
import { rng } from '@/lib/util';

/**
 * Procedurally drawn Devil Fruit: every fruit gets a deterministic body shape,
 * colour and swirl pattern from its name. Ink outline, hatched shadow,
 * manga-flat highlight.
 */

const PALETTES: Record<string, Array<[string, string]>> = {
  Paramecia: [
    ['#8b43b5', '#4f1c72'],
    ['#d24a7c', '#83193f'],
    ['#4072d1', '#1b3a86'],
    ['#e07b2f', '#97420f'],
    ['#39a37b', '#1a6748'],
    ['#c4426b', '#6e1736'],
  ],
  Zoan: [
    ['#f0a43a', '#ad650e'],
    ['#cda22a', '#83670c'],
    ['#d9703b', '#8f3c18'],
  ],
  'Ancient Zoan': [
    ['#6f8f3a', '#3f5a19'],
    ['#8d6c40', '#553f1e'],
  ],
  'Mythical Zoan': [
    ['#f2d24a', '#a98410'],
    ['#f5f1e6', '#a59f8e'],
    ['#4fb4c8', '#1d6c7c'],
  ],
  Logia: [
    ['#3aa2d8', '#16598a'],
    ['#e44a3b', '#991f16'],
    ['#f3cf3c', '#ad8b0b'],
    ['#8a8a8a', '#3c3c3c'],
    ['#7ec8e3', '#2f7896'],
  ],
  SMILE: [['#d8261c', '#8a110b']],
  Artificial: [['#9aa2a8', '#59606a']],
  Unknown: [['#a59c8c', '#5d564c']],
};

const SHAPES = [
  // round apple
  'M60 34 C88 30 104 50 102 76 C100 104 82 118 60 118 C38 118 20 104 18 76 C16 50 32 30 60 34Z',
  // tall pear
  'M60 30 C76 30 82 44 84 56 C98 66 104 82 98 98 C92 114 76 120 60 120 C44 120 28 114 22 98 C16 82 22 66 36 56 C38 44 44 30 60 30Z',
  // peach / heart
  'M60 40 C70 28 98 30 102 60 C106 90 84 116 60 120 C36 116 14 90 18 60 C22 30 50 28 60 40Z',
  // wide melon
  'M60 38 C92 36 110 56 108 80 C106 104 86 116 60 116 C34 116 14 104 12 80 C10 56 28 36 60 38Z',
  // gourd
  'M60 30 C74 30 78 42 74 52 C96 58 104 78 98 96 C92 114 76 120 60 120 C44 120 28 114 22 96 C16 78 24 58 46 52 C42 42 46 30 60 30Z',
];

function spiral(cx: number, cy: number, radius: number, turns: number, rot: number, dir: number) {
  const pts: string[] = [];
  const max = turns * Math.PI * 2;
  for (let t = 0; t <= max; t += 0.5) {
    const rr = (t / max) * radius;
    const a = rot + dir * t;
    pts.push(`${Math.round(cx + Math.cos(a) * rr)} ${Math.round(cy + Math.sin(a) * rr)}`);
  }
  return `M${pts.join('L')}`;
}

export function FruitGlyph({
  seed,
  type = 'Paramecia',
  className,
  style,
  hatch = true,
}: {
  seed: string;
  type?: string;
  className?: string;
  style?: CSSProperties;
  hatch?: boolean;
}) {
  const r = rng(seed);
  const palette = PALETTES[type] ?? PALETTES.Unknown;
  const [base, deep] = palette[Math.floor(r() * palette.length)];
  const shape = SHAPES[Math.floor(r() * SHAPES.length)];
  const id = `fg-${seed.replace(/[^a-z0-9]/gi, '').slice(0, 24)}-${Math.floor(r() * 1e6)}`;

  const swirls: string[] = [];
  const n = 9 + Math.floor(r() * 5);
  for (let i = 0; i < n; i++) {
    const x = 26 + r() * 68;
    const y = 46 + r() * 66;
    const rad = 6 + r() * 4;
    swirls.push(spiral(x, y, rad, 2.1, r() * Math.PI * 2, r() > 0.5 ? 1 : -1));
  }
  const hatchLines: string[] = [];
  for (let i = 0; i < 26; i++) {
    const o = i * 5;
    hatchLines.push(`M${40 + o} 130L${130 + o} 40`);
  }
  const leafFlip = r() > 0.5 ? 1 : -1;

  return (
    <svg viewBox="0 0 120 130" className={className} style={style} aria-hidden>
      <defs>
        <clipPath id={`${id}-c`}>
          <path d={shape} />
        </clipPath>
      </defs>
      <path d={shape} fill={base} />
      <g clipPath={`url(#${id}-c)`}>
        <path d={swirls.join('')} fill="none" stroke={deep} strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="84" cy="96" rx="44" ry="40" fill="var(--ink)" opacity="0.16" />
        {hatch && <path d={hatchLines.join('')} stroke="var(--ink)" strokeWidth="0.9" opacity="0.28" transform="translate(-30 0)" style={{ clipPath: 'circle(42% at 78% 80%)' }} />}
        <ellipse cx="42" cy="56" rx="11" ry="7" fill="#fff" opacity="0.55" transform="rotate(-30 42 56)" />
      </g>
      <path d={shape} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path
        d={`M60 36 C60 22 ${60 + 10 * leafFlip} 14 ${60 + 18 * leafFlip} 18 C${60 + 24 * leafFlip} 21 ${60 + 22 * leafFlip} 29 ${60 + 16 * leafFlip} 28`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d={`M60 36 C60 22 ${60 + 10 * leafFlip} 14 ${60 + 18 * leafFlip} 18 C${60 + 24 * leafFlip} 21 ${60 + 22 * leafFlip} 29 ${60 + 16 * leafFlip} 28`}
        fill="none"
        stroke="#4f7d22"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d={`M${60 - 2 * leafFlip} 32 C${60 - 14 * leafFlip} 18 ${60 - 30 * leafFlip} 22 ${60 - 34 * leafFlip} 28 C${60 - 26 * leafFlip} 36 ${60 - 12 * leafFlip} 36 ${60 - 2 * leafFlip} 32Z`}
        fill="#6aa232"
        stroke="var(--ink)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
