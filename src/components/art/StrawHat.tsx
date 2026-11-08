import type { CSSProperties } from 'react';
import { rng } from '@/lib/util';

/** A straw hat in manga ink: woven brim, red band, frayed edge. */

const r = rng('straw-hat');
const brimStrands: string[] = [];
for (let i = 0; i < 46; i++) {
  const a = (i / 46) * Math.PI * 2 + (r() - 0.5) * 0.05;
  const x1 = 100 + Math.cos(a) * 52;
  const y1 = 80 + Math.sin(a) * 12;
  const x2 = 100 + Math.cos(a) * (88 + r() * 6);
  const y2 = 80 + Math.sin(a) * (21 + r() * 2);
  brimStrands.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
}
const crownStrands: string[] = [];
for (let i = 0; i < 9; i++) {
  const y = 34 + i * 3.3;
  const half = Math.sqrt(Math.max(0, 1 - Math.pow((y - 60) / 34, 2))) * 44;
  crownStrands.push(`M${(100 - half).toFixed(1)} ${y.toFixed(1)}Q100 ${(y + 3.5).toFixed(1)} ${(100 + half).toFixed(1)} ${y.toFixed(1)}`);
}
const frays: string[] = [];
for (let i = 0; i < 26; i++) {
  const a = (i / 26) * Math.PI * 2 + r() * 0.1;
  const x = 100 + Math.cos(a) * 95;
  const y = 80 + Math.sin(a) * 23.5;
  const dx = Math.cos(a) * (3 + r() * 4);
  const dy = Math.sin(a) * (1 + r() * 2);
  frays.push(`M${x.toFixed(1)} ${y.toFixed(1)}l${dx.toFixed(1)} ${dy.toFixed(1)}`);
}

export function StrawHat({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 112" className={className} style={style} aria-hidden>
      <defs>
        <clipPath id="sh-brim-back">
          <rect x="0" y="0" width="200" height="80" />
        </clipPath>
        <clipPath id="sh-brim-front">
          <rect x="0" y="80" width="200" height="40" />
        </clipPath>
      </defs>
      {/* back half of the brim */}
      <g clipPath="url(#sh-brim-back)">
        <ellipse cx="100" cy="80" rx="95" ry="23.5" fill="var(--straw)" stroke="var(--ink)" strokeWidth="3" />
        <path d={brimStrands.join('')} stroke="var(--straw-deep)" strokeWidth="1.1" opacity="0.8" />
      </g>
      {/* crown */}
      <path d="M56 80 C52 26 148 26 144 80 C124 90 76 90 56 80Z" fill="var(--straw)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d={crownStrands.join('')} fill="none" stroke="var(--straw-deep)" strokeWidth="1.1" opacity="0.85" />
      {/* red band */}
      <path d="M57.5 64 C78 73 122 73 142.5 64 L143.6 79 C122 88.5 78 88.5 56.4 79Z" fill="var(--red)" stroke="var(--ink)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M62 71 C84 78 116 78 138 71" fill="none" stroke="var(--red-deep)" strokeWidth="1.4" opacity="0.7" />
      {/* front half of the brim */}
      <g clipPath="url(#sh-brim-front)">
        <ellipse cx="100" cy="80" rx="95" ry="23.5" fill="var(--straw)" stroke="var(--ink)" strokeWidth="3" />
        <path d={brimStrands.join('')} stroke="var(--straw-deep)" strokeWidth="1.1" opacity="0.8" />
        <ellipse cx="100" cy="84" rx="60" ry="9" fill="none" stroke="var(--ink)" strokeWidth="1.2" opacity="0.5" />
      </g>
      <path d={frays.join('')} stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
      {/* highlight */}
      <path d="M74 44 C80 36 92 33 102 33" fill="none" stroke="#fff6d5" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
