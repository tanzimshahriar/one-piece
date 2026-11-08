import type { CSSProperties, SVGProps } from 'react';
import { rng } from '@/lib/util';

/** The Berry currency mark: a B struck by a single vertical bar. */
export function Berry({ className, style, title = 'Berries' }: { className?: string; style?: CSSProperties; title?: string }) {
  return (
    <svg viewBox="0 0 22 32" className={className} style={{ height: '0.82em', width: 'auto', ...style }} role="img" aria-label={title}>
      <path
        d="M5 5.5h8.2a5 5 0 0 1 0 10H5m0 0h9.2a5.6 5.6 0 0 1 0 11.2H5z M5 4.5v23.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path d="M10.8 1v30" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

export function Arrow({ className, dir = 'right' }: { className?: string; dir?: 'right' | 'left' | 'up' | 'down' | 'ne' }) {
  const rot = { right: 0, down: 90, left: 180, up: -90, ne: -45 }[dir];
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ width: '1em', height: '1em', transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M3 12h17M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    </svg>
  );
}

/** Hidden SVG filter defs shared by the whole document. */
export function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
      <filter id="ink-rough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="ink-bleed">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
      </filter>
    </svg>
  );
}

const STATUS_META = {
  Alive: { jp: '生存', label: 'Alive', color: 'var(--sea)' },
  Deceased: { jp: '死亡', label: 'Deceased', color: 'var(--red)' },
  Unknown: { jp: '不明', label: 'Unknown', color: 'var(--ink-soft)' },
} as const;

/** Hanko-style seal stamp for a character's status. */
export function StatusStamp({ status, className, style }: { status: 'Alive' | 'Deceased' | 'Unknown'; className?: string; style?: CSSProperties }) {
  const meta = STATUS_META[status];
  return (
    <span className={`stamp ${className ?? ''}`} style={{ color: meta.color, ...style }}>
      <span style={{ fontSize: '1.7em', letterSpacing: '0.08em' }}>{meta.jp}</span>
      <span className="t-kicker" style={{ fontSize: '0.62em', letterSpacing: '0.24em' }}>
        {meta.label}
      </span>
    </span>
  );
}

export const statusMeta = STATUS_META;

/** Concentration lines (集中線) radiating toward a clear centre. Deterministic per seed. */
export function SpeedLines({
  seed = 'lines',
  count = 140,
  inner = 0.5,
  className,
  style,
  color = 'currentColor',
}: {
  seed?: string;
  count?: number;
  inner?: number;
  className?: string;
  style?: CSSProperties;
  color?: string;
}) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    if (r() < 0.18) continue;
    const a = (i / count) * Math.PI * 2 + (r() - 0.5) * 0.03;
    const w = 0.004 + r() * r() * 0.022;
    const R = 160;
    const ri = inner * 100 * (0.82 + r() * 0.5);
    const p = (ang: number, rad: number) => `${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`;
    d += `M${p(a - w, R)}L${p(a + w, R)}L${p(a, ri)}Z`;
  }
  return (
    <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice" className={className} style={style} aria-hidden>
      <path d={d} fill={color} />
    </svg>
  );
}

/** A compass rose for charts. */
export function Compass({ className, style, bare = false }: { className?: string; style?: CSSProperties; bare?: boolean }) {
  const ticks = Array.from({ length: 64 }, (_, i) => i);
  const point = (deg: number, len: number, wide: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    const l = (deg2: number, r: number) => {
      const b = ((deg2 - 90) * Math.PI) / 180;
      return `${(Math.cos(b) * r).toFixed(2)},${(Math.sin(b) * r).toFixed(2)}`;
    };
    return { tip: `${(Math.cos(a) * len).toFixed(2)},${(Math.sin(a) * len).toFixed(2)}`, left: l(deg - wide, 14), right: l(deg + wide, 14) };
  };
  const body = (
    <>
      <circle r="98" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle r="91" fill="none" stroke="currentColor" strokeWidth="0.6" />
      {ticks.map((i) => {
        const a = (i / 64) * Math.PI * 2;
        const long = i % 8 === 0;
        return (
          <line
            key={i}
            x1={(Math.cos(a) * 91).toFixed(2)}
            y1={(Math.sin(a) * 91).toFixed(2)}
            x2={(Math.cos(a) * (long ? 80 : 86)).toFixed(2)}
            y2={(Math.sin(a) * (long ? 80 : 86)).toFixed(2)}
            stroke="currentColor"
            strokeWidth={long ? 1.4 : 0.6}
          />
        );
      })}
      {[45, 135, 225, 315].map((deg) => {
        const p = point(deg, 58, 30);
        return <polygon key={deg} points={`${p.tip} ${p.left} 0,0 ${p.right}`} fill="currentColor" opacity="0.35" />;
      })}
      {[0, 90, 180, 270].map((deg, i) => {
        const p = point(deg, 82, 26);
        return (
          <g key={deg}>
            <polygon points={`${p.tip} ${p.left} 0,0`} fill="currentColor" />
            <polygon points={`${p.tip} ${p.right} 0,0`} fill="none" stroke="currentColor" strokeWidth="1" />
            {i === 0 && <polygon points={`${p.tip} ${p.left} 0,0`} fill="var(--red)" />}
          </g>
        );
      })}
      <circle r="6" fill="var(--paper)" stroke="currentColor" strokeWidth="1.5" />
      <text y="-102" textAnchor="middle" fontSize="13" fontFamily="var(--font-display)" fill="currentColor" dy="-2">
        N
      </text>
    </>
  );
  if (bare) return <g>{body}</g>;
  return (
    <svg viewBox="-110 -110 220 220" className={className} style={style} aria-hidden>
      {body}
    </svg>
  );
}

/** Woodblock-style wave band used as a section divider. */
export function WaveBand({
  className,
  style,
  seed = 'waves',
  fill = 'var(--ink)',
  line = 'var(--paper)',
  ...rest
}: { className?: string; style?: CSSProperties; seed?: string; fill?: string; line?: string } & SVGProps<SVGSVGElement>) {
  const r = rng(seed);
  const W = 1600;
  const n = 18;
  const step = W / n;
  let top = `M0 60`;
  const curls: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const h = 26 + r() * 22;
    top += ` C${x + step * 0.35} ${60 - h} ${x + step * 0.75} ${60 - h * 1.1} ${x + step * 0.92} ${42 - h * 0.25}`;
    top += ` Q${x + step * 0.98} ${56} ${x + step} 60`;
    const cx = x + step * 0.78;
    const cy = 50 - h * 0.45;
    curls.push(`M${cx} ${cy} a7 7 0 1 1 6 7 a4 4 0 1 1 -3 -5`);
  }
  const body = `${top} L${W} 120 L0 120 Z`;
  const stripes = [76, 90, 104].map((y, k) => {
    let d = `M0 ${y}`;
    for (let i = 0; i < n; i++) {
      const x = i * step;
      d += ` Q${x + step / 2} ${y - 8 - k * 2} ${x + step} ${y}`;
    }
    return d;
  });
  return (
    <svg viewBox="0 0 1600 120" preserveAspectRatio="none" className={className} style={style} aria-hidden {...rest}>
      <path d={body} fill={fill} />
      {stripes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={line} strokeWidth={1.6 - i * 0.3} opacity={0.75 - i * 0.18} />
      ))}
      {curls.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={line} strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/** Hand-drawn style asterisk / star used as a separator. */
export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ width: '0.8em', height: '0.8em' }} aria-hidden>
      <path d="M12 1l2.6 7.6L22 9.4l-6 4.9 2.2 7.7L12 17.6 5.8 22 8 14.3 2 9.4l7.4-.8z" fill="currentColor" />
    </svg>
  );
}
