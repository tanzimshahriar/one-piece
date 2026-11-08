'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="page-x grid min-h-[80svh] place-items-center pt-[var(--header-h)] text-center">
      <div>
        <p className="t-kicker text-[11px] text-red">Storm warning · 嵐</p>
        <h1 className="t-display mt-4 text-[clamp(2.5rem,8vw,6rem)]">The sea turned rough.</h1>
        <p className="t-ital mx-auto mt-4 max-w-lg text-xl text-ink-soft">
          One of our logbooks didn’t answer. The upstream One Piece APIs may be napping — try again in a moment.
        </p>
        <button type="button" onClick={reset} className="btn-ink mt-8">
          Try again
        </button>
      </div>
    </section>
  );
}
