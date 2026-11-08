import 'server-only';

/**
 * Module-level promise memo. Next's fetch cache already de-duplicates network
 * calls, but the merged/normalised datasets are rebuilt from dozens of cached
 * responses — memoising the result keeps warm servers and static builds fast.
 */
const store = new Map<string, { at: number; promise: Promise<unknown> }>();

export function memo<T>(key: string, fn: () => Promise<T>, opts: { ttl?: number; isEmpty?: (value: T) => boolean } = {}): Promise<T> {
  const ttl = opts.ttl ?? 15 * 60_000;
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.promise as Promise<T>;

  const promise = fn().then(
    (value) => {
      if (opts.isEmpty?.(value)) store.delete(key);
      return value;
    },
    (error) => {
      store.delete(key);
      throw error;
    },
  );
  store.set(key, { at: Date.now(), promise });
  return promise;
}
