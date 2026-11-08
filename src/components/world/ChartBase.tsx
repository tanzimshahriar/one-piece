import { Compass } from '../art/Glyphs';

/** The static layers of the world chart (viewBox 0 0 1600 1000). */
export function ChartDefs() {
  return (
    <defs>
      <pattern id="ch-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--ink)" strokeWidth="1" />
      </pattern>
      <pattern id="ch-red" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <line x1="0" y1="0" x2="0" y2="7" stroke="var(--red)" strokeWidth="2.2" />
      </pattern>
      <pattern id="ch-dots" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx="4.5" cy="4.5" r="1.1" fill="var(--sea)" />
      </pattern>
      <pattern id="ch-waves" width="90" height="46" patternUnits="userSpaceOnUse">
        <path d="M6 20 q8 -8 16 0 t16 0" fill="none" stroke="var(--sea)" strokeWidth="1.3" opacity="0.5" />
        <path d="M52 40 q8 -8 16 0 t16 0" fill="none" stroke="var(--sea)" strokeWidth="1.3" opacity="0.5" />
      </pattern>
      <filter id="ch-rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
      </filter>
    </defs>
  );
}

function SeaLabel({ x, y, name, jp }: { x: number; y: number; name: string; jp: string }) {
  return (
    <g transform={`translate(${x} ${y})`} style={{ pointerEvents: 'none' }}>
      <text textAnchor="middle" fontFamily="var(--font-display)" fontSize="54" fill="none" stroke="var(--ink)" strokeWidth="1.2" opacity="0.5" letterSpacing="4">
        {name}
      </text>
      <text textAnchor="middle" y="34" fontFamily="var(--font-mono)" fontSize="14" fill="var(--ink-soft)" letterSpacing="6">
        {jp}
      </text>
    </g>
  );
}

export function ChartBase({ dim }: { dim?: string }) {
  const op = (region: string) => (dim && dim !== region ? 0.25 : 1);
  const ticks = [];
  for (let x = 0; x <= 1600; x += 20) ticks.push(<line key={`tx${x}`} x1={x} y1={0} x2={x} y2={x % 100 === 0 ? 14 : 7} stroke="var(--ink)" strokeWidth="1" />);
  for (let y = 0; y <= 1000; y += 20) ticks.push(<line key={`ty${y}`} x1={0} y1={y} x2={y % 100 === 0 ? 14 : 7} y2={y} stroke="var(--ink)" strokeWidth="1" />);

  return (
    <g>
      {/* seas */}
      <rect x="0" y="0" width="1600" height="1000" fill="url(#ch-waves)" />
      <rect x="0" y="0" width="1600" height="1000" fill="url(#ch-dots)" opacity="0.12" />

      {/* graticule */}
      <g stroke="var(--ink)" strokeWidth="0.6" opacity="0.18">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 100} y1="0" x2={(i + 1) * 100} y2="1000" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * 100} x2="1600" y2={(i + 1) * 100} />
        ))}
      </g>

      {/* calm belts */}
      <g opacity={op('Calm Belt')}>
        <rect x="0" y="400" width="1600" height="40" fill="url(#ch-hatch)" opacity="0.3" />
        <rect x="0" y="560" width="1600" height="40" fill="url(#ch-hatch)" opacity="0.3" />
        {[180, 1060].map((x) => (
          <text key={x} x={x} y="424" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="5" fill="var(--ink)" opacity="0.7">
            CALM BELT · 凪の帯
          </text>
        ))}
      </g>

      {/* grand line */}
      <rect x="0" y="440" width="1600" height="120" fill="var(--paper)" opacity="0.9" />
      <rect x="0" y="440" width="1600" height="120" fill="url(#ch-dots)" opacity="0.18" />
      <line x1="0" y1="440" x2="1600" y2="440" stroke="var(--ink)" strokeWidth="2" strokeDasharray="10 6" />
      <line x1="0" y1="560" x2="1600" y2="560" stroke="var(--ink)" strokeWidth="2" strokeDasharray="10 6" />
      <text x="410" y="582" textAnchor="middle" fontFamily="var(--font-display)" fontSize="16" letterSpacing="10" fill="var(--ink)" opacity={op('Paradise')}>
        PARADISE · 楽園
      </text>
      <text x="1200" y="582" textAnchor="middle" fontFamily="var(--font-display)" fontSize="16" letterSpacing="10" fill="var(--ink)" opacity={op('New World')}>
        NEW WORLD · 新世界
      </text>

      {/* red line, and its wrap-around at both edges */}
      <g opacity={op('Red Line')}>
        <path d="M772 0 C780 160 764 320 776 500 C786 680 768 840 774 1000 L826 1000 C832 840 814 680 824 500 C836 320 820 160 828 0Z" fill="url(#ch-red)" stroke="var(--red)" strokeWidth="2.5" />
        <path d="M0 0 H22 C28 250 16 500 24 750 C28 880 20 950 22 1000 H0Z" fill="url(#ch-red)" stroke="var(--red)" strokeWidth="2" />
        <path d="M1600 0 H1578 C1572 250 1584 500 1576 750 C1572 880 1580 950 1578 1000 H1600Z" fill="url(#ch-red)" stroke="var(--red)" strokeWidth="2" />
        <text x="800" y="300" textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" letterSpacing="6" fill="var(--red)" transform="rotate(-90 800 300)">
          RED LINE · 赤い土の大陸
        </text>
      </g>

      <g opacity={op('East Blue')}>
        <SeaLabel x={395} y={250} name="EAST BLUE" jp="東の海" />
      </g>
      <g opacity={op('North Blue')}>
        <SeaLabel x={1205} y={250} name="NORTH BLUE" jp="北の海" />
      </g>
      <g opacity={op('West Blue')}>
        <SeaLabel x={395} y={800} name="WEST BLUE" jp="西の海" />
      </g>
      <g opacity={op('South Blue')}>
        <SeaLabel x={1205} y={800} name="SOUTH BLUE" jp="南の海" />
      </g>

      {/* sky cartouche */}
      <g opacity={op('Sky')}>
        <rect x="600" y="70" width="400" height="116" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 5" rx="58" />
        <text x="800" y="64" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="4" fill="var(--ink)">
          WHITE SEA · 白海 · 10,000 M ABOVE
        </text>
      </g>

      {/* frame */}
      <rect x="1" y="1" width="1598" height="998" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <rect x="10" y="10" width="1580" height="980" fill="none" stroke="var(--ink)" strokeWidth="0.8" />
      {ticks}

      <g transform="translate(150 880) scale(0.6)" color="var(--ink)">
        <Compass bare />
      </g>

      <g transform="translate(1300 900)">
        <rect x="0" y="0" width="270" height="70" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="5" y="5" width="260" height="60" fill="none" stroke="var(--ink)" strokeWidth="0.8" />
        <text x="135" y="32" textAnchor="middle" fontFamily="var(--font-display)" fontSize="18" fill="var(--ink)">
          CARTA MARINA
        </text>
        <text x="135" y="52" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="3" fill="var(--ink-soft)">
          SPLIT AT REVERSE MOUNTAIN
        </text>
      </g>
    </g>
  );
}
