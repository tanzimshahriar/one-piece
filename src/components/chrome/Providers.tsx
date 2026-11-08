'use client';

import Lenis from 'lenis';
import { MotionConfig } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Ctx = { lenis: Lenis | null; searchOpen: boolean; setSearchOpen: (open: boolean) => void };
const AppContext = createContext<Ctx>({ lenis: null, searchOpen: false, setSearchOpen: () => {} });
export const useApp = () => useContext(AppContext);

export function Providers({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const instance = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    setLenis(instance);
    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  useEffect(() => {
    if (!lenis) return;
    if (searchOpen) lenis.stop();
    else lenis.start();
  }, [searchOpen, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AppContext.Provider value={{ lenis, searchOpen, setSearchOpen }}>{children}</AppContext.Provider>
    </MotionConfig>
  );
}
