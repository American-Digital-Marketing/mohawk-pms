/**
 * A small utility function on records to either append to an existing array at KEY,
 * or instatiate a new array at KEY with one entry VAL.
 */
export function safePush<V>(record: Record<string, V[]>, key: string, val: V) {
  if (!record[key]) {
    record[key] = [val];
  } else {
    record[key].push(val);
  }
}

export function distributeWork<T>(array: T[], nThreads: number): T[][] {
  const result: T[][] = [];
  const quotient = Math.floor(array.length / nThreads);
  const remainder = array.length % nThreads;

  for (let i = 0; i < nThreads; i++) {
    let start = 0;
    let end = 0;

    const hasBonus = i < remainder;
    if (hasBonus) {
      start = (quotient * i) + i;
      end = start + quotient + 1;
    } else {
      start = (quotient * i) + remainder;
      end = start + quotient;
    }

    const batch = array.slice(start, end);
    result.push(batch);
  }
  return result;
}
