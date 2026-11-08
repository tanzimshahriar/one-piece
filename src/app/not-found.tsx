import Link from 'next/link';
import { SpeedLines, Arrow } from '@/components/art/Glyphs';

export default function NotFound() {
  return (
    <section className="page-x relative grid min-h-[90svh] place-items-center overflow-hidden pt-[var(--header-h)]">
      <SpeedLines seed="404" inner={0.42} className="pointer-events-none absolute inset-0 h-full w-full text-ink opacity-[0.12]" />
      <div className="relative text-center">
        <p className="t-kicker text-[11px] text-red">Error 404 · 遭難</p>
        <h1 className="sfx mt-4 text-[clamp(5rem,22vw,18rem)]">ドーン!!</h1>
        <p className="t-display mt-2 text-[clamp(2rem,5vw,4rem)]">Lost at sea.</p>
        <p className="t-ital mx-auto mt-4 max-w-md text-xl text-ink-soft">
          This page isn’t on any chart we own. Even Zoro would struggle to get lost this badly.
        </p>
        <Link href="/" className="btn-ink mt-10" data-cursor="Home">
          Return to port <Arrow />
        </Link>
      </div>
    </section>
  );
}
