'use client';

import { useEffect, useRef, useState } from 'react';

/** Ink-dot cursor follower that swells into a speech bubble over [data-cursor] targets. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);
    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      const target = (e.target as Element | null)?.closest?.('[data-cursor]');
      setLabel(target ? target.getAttribute('data-cursor') : null);
    };
    const onLeave = () => {
      pos.tx = -100;
      pos.ty = -100;
    };
    const loop = () => {
      pos.x += (pos.tx - pos.x) * 0.2;
      pos.y += (pos.ty - pos.y) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[190]" aria-hidden>
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink transition-[width,height,background-color] duration-300 ease-out ${
          label ? 'h-[86px] w-[86px] bg-paper' : 'h-3 w-3 bg-ink'
        }`}
      >
        <span className={`t-kicker text-center text-[10px] leading-tight text-ink transition-opacity duration-200 ${label ? 'opacity-100' : 'opacity-0'}`}>
          {label}
        </span>
        {label && <span className="absolute -bottom-2 left-3 h-4 w-4 rotate-[35deg] border-b-2 border-r-2 border-ink bg-paper" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />}
      </div>
    </div>
  );
}
