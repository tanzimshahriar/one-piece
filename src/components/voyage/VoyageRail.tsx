'use client';

import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

/** A dashed course down the margin; a little ship sails it as you scroll. */
export function VoyageRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 60%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const top = useTransform(progress, (v) => `${v * 100}%`);
  const rock = useTransform(progress, (v) => Math.sin(v * 80) * 8);

  return (
    <div ref={ref} className="relative">
      <div className="pointer-events-none absolute bottom-0 left-[calc(var(--gutter)/2-1px)] top-0 hidden w-[3px] md:block" aria-hidden>
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, var(--ink) 0 8px, transparent 8px 16px)' }} />
        <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-red" style={{ scaleY: progress }} />
        <motion.div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top }}>
          <motion.svg viewBox="0 0 48 40" className="w-9" style={{ rotate: rock }}>
            <path d="M4 26 H44 L38 36 H10 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 26 V4" stroke="var(--ink)" strokeWidth="2.5" />
            <path d="M24 6 C34 8 36 18 26 22 L24 22 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M24 8 C16 10 14 18 22 21 L24 21Z" fill="var(--red)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="24" cy="3" r="2" fill="var(--ink)" />
          </motion.svg>
        </motion.div>
      </div>
      {children}
    </div>
  );
}
