export function permute(items: number[]): number[][] {
  if (items.length <= 1) {
    return [items];
  }

  const result: number[][] = [];

  for (const [i, first] of items.entries()) {
    const rest = items.filter((_, index) => index !== i);
    const restPermutations = permute(rest);
    for (const perm of restPermutations) {
      result.push([first, ...perm]);
    }
  }

  return result;
}
