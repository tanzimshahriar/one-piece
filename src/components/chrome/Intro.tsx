import { SpeedLines } from '../art/Glyphs';

/**
 * First-visit title card. Pure CSS: a Log Pose needle settles, a counter runs
 * to 100, then the card dissolves through a halftone mask. Skipped on later
 * navigations via a sessionStorage flag set by an inline <head> script.
 */
export function Intro() {
  return (
    <div className="intro fixed inset-0 z-[160] grid place-items-center bg-ink text-paper" aria-hidden>
      <SpeedLines seed="intro" inner={0.55} count={160} className="absolute inset-0 h-full w-full text-paper opacity-[0.08]" />
      <div className="relative flex flex-col items-center gap-6">
        <svg viewBox="0 0 120 150" className="w-24 md:w-28">
          <rect x="34" y="118" width="52" height="22" rx="4" fill="none" stroke="var(--paper)" strokeWidth="3" />
          <path d="M42 118v-8h36v8" fill="none" stroke="var(--paper)" strokeWidth="3" />
          <circle cx="60" cy="62" r="48" fill="none" stroke="var(--paper)" strokeWidth="3" />
          <path d="M28 40 A40 40 0 0 1 52 18" fill="none" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          <g className="intro-needle" style={{ transformOrigin: '60px 62px' }}>
            <polygon points="60,22 66,62 60,70 54,62" fill="var(--red)" />
            <polygon points="60,102 66,62 60,54 54,62" fill="var(--paper)" />
          </g>
          <circle cx="60" cy="62" r="4" fill="var(--ink)" stroke="var(--paper)" strokeWidth="2" />
        </svg>
        <p className="t-display text-[clamp(2.6rem,8vw,6rem)] leading-none">GRAND LINE</p>
        <div className="flex items-center gap-4">
          <span className="t-kicker text-[10px] text-paper/60">Setting the Log Pose</span>
          <span className="intro-count t-kicker num text-[10px] text-straw" />
        </div>
      </div>
    </div>
  );
}
