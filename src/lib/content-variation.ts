// Deterministic pseudo-random selection: same seed always yields the same
// pick (stable across rebuilds/regenerations), but different seeds (e.g.
// different calculator keys) spread across the pool instead of every page
// reusing variant #0.
const stableIndex = (seed: string, poolSize: number): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % poolSize;
};

export const pick = <T>(seed: string, pool: readonly T[]): T => pool[stableIndex(seed, pool.length)];

export const pickTwoDistinct = <T>(seed: string, pool: readonly T[]): [T, T] => {
  const first = stableIndex(seed, pool.length);
  const second = stableIndex(`${seed}-2`, pool.length - 1);
  const secondIndex = second >= first ? second + 1 : second;
  return [pool[first], pool[secondIndex]];
};
