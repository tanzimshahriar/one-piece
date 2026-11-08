import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Grand Line — The One Piece Almanac';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const rays = Array.from({ length: 48 }, (_, i) => i);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#f2e9d8', overflow: 'hidden' }}>
        {rays.map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 600,
              top: 315,
              width: 900,
              height: i % 3 === 0 ? 6 : 3,
              background: '#121110',
              opacity: 0.18,
              transformOrigin: '0 50%',
              transform: `rotate(${(i / rays.length) * 360}deg) translateX(240px)`,
            }}
          />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: '#0c2c55', display: 'flex' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 26, letterSpacing: 8, color: '#d8261c', fontWeight: 700 }}>THE ONE PIECE ALMANAC</div>
          <div style={{ fontSize: 168, fontWeight: 900, color: '#121110', letterSpacing: -6, lineHeight: 1 }}>GRAND LINE</div>
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              color: '#121110',
              background: '#f2e9d8',
              border: '4px solid #121110',
              padding: '10px 26px',
              fontStyle: 'italic',
            }}
          >
            Every pirate, fruit, island &amp; bounty — drawn in ink.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
