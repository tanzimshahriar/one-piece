import { rng } from '@/lib/util';

const HANDLES = ['#1f1d1b', '#7a1712', '#f1ece0', '#3b2a57', '#22513a', '#6b4a1f'];

/** A sheathless katana in profile, with wrapped grip and wavy hamon. */
export function Katana({ seed, black = false, broken = false, className }: { seed: string; black?: boolean; broken?: boolean; className?: string }) {
  const r = rng(seed);
  const handle = HANDLES[Math.floor(r() * HANDLES.length)];
  const wrap = handle === '#f1ece0' ? '#1f1d1b' : '#efe6d2';
  const tip = broken ? 470 : 632;
  const diamonds: string[] = [];
  for (let x = 52; x < 172; x += 14) diamonds.push(`M${x} 35 L${x + 7} 28.5 L${x + 14} 35 L${x + 7} 41.5Z`);
  let hamon = 'M214 37';
  for (let x = 214; x < tip - 40; x += 12) {
    const y = 37 - ((x - 214) / (tip - 214)) * 13;
    hamon += ` Q${x + 6} ${y + (r() > 0.5 ? -3.2 : 2.2)} ${x + 12} ${y}`;
  }
  const blade = black ? 'var(--ink)' : '#ece6d8';
  const bladeLine = black ? '#5d564c' : 'var(--ink)';
  return (
    <svg viewBox="0 0 640 64" className={className} aria-hidden>
      <path
        d={`M206 27 Q420 24 ${tip} 13 ${broken ? `L${tip - 6} 24 L${tip + 3} 28` : ''} Q${tip - 30} 30 ${tip - 70} 34 Q420 42 206 43Z`}
        fill={blade}
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={hamon} fill="none" stroke={bladeLine} strokeWidth="1" opacity="0.55" />
      <path d={`M206 30 Q420 27.5 ${tip - 12} 17`} fill="none" stroke={black ? '#3a3631' : '#fff'} strokeWidth="1.2" opacity="0.8" />
      <rect x="194" y="26" width="13" height="18" fill="var(--straw-deep)" stroke="var(--ink)" strokeWidth="1.6" />
      <ellipse cx="188" cy="35" rx="6.5" ry="21" fill="var(--ink)" />
      <ellipse cx="188" cy="35" rx="3" ry="14" fill="none" stroke="var(--straw-deep)" strokeWidth="1.2" />
      <rect x="42" y="27" width="140" height="16" rx="3" fill={handle} stroke="var(--ink)" strokeWidth="2" />
      <path d={diamonds.join('')} fill={wrap} opacity="0.9" />
      <rect x="32" y="26" width="12" height="18" rx="3" fill="var(--ink)" />
    </svg>
  );
}
