'use client';

import { animate, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Reduced-motion preference that is identical on server and first client render. */
export function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  as = 'div',
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'p';
  style?: CSSProperties;
}) {
  const reduced = useReducedMotionSafe();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

/** Words rise out of an ink gutter, one after another. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  as = 'span',
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduced = useReducedMotionSafe();
  const show = immediate || inView || reduced;
  const lines = text.split('\n');
  const Comp = as as 'span';
  let i = 0;
  return (
    <Comp ref={ref as React.RefObject<HTMLSpanElement>} className={className} aria-label={text.replace(/\n/g, ' ')}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(' ').map((word, wi) => {
            const index = i++;
            return (
              <span key={wi} className="inline-block overflow-hidden pb-[0.06em] align-top" style={{ marginRight: '0.22em' }}>
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%', rotate: 4 }}
                  animate={show ? { y: '0%', rotate: 0 } : undefined}
                  transition={{ duration: 1, delay: delay + index * stagger, ease: EASE }}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </Comp>
  );
}

export function Counter({ value, className, duration = 1.8, format = true }: { value: number; className?: string; duration?: number; format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotionSafe();
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);
  return (
    <span ref={ref} className={`num ${className ?? ''}`}>
      {format ? display.toLocaleString('en-US') : display}
    </span>
  );
}

/** Punchy SFX lettering that slams in when it enters the viewport. */
export function Sfx({ text, className, rotate = -10, delay = 0, style }: { text: string; className?: string; rotate?: number; delay?: number; style?: CSSProperties }) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.span
      aria-hidden
      className={`sfx pointer-events-none inline-block select-none ${className ?? ''}`}
      style={style}
      initial={{ scale: 2.4, opacity: 0, rotate: rotate - 20 }}
      whileInView={{ scale: 1, opacity: 1, rotate }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 18, mass: 0.9 }}
    >
      {text}
    </motion.span>
  );
}

/** Translate a child vertically with scroll for gentle parallax. */
export function Parallax({ children, className, offset = 80 }: { children: ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const reduced = useReducedMotionSafe();
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Tilt a card toward the pointer. */
export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgressBar({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div className={className} style={{ scaleX, transformOrigin: '0 50%' }} />;
}
