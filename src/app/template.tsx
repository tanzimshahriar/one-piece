/** Re-mounts on every navigation: the halftone ink veil dissolves over each new page. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="ink-veil" aria-hidden />
      {children}
    </>
  );
}
