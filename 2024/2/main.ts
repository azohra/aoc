const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Sequence = number[];

const parseInput = (input: string): Sequence[] => {
  return input.trim().split("\n").map(line => 
    line.trim().split(/\s+/).map(Number)
  );
};

const isSafe = (seq: Sequence): boolean => {
  const diffs = seq.slice(1).map((n, i) => n - seq[i]);
  const isMonotonic = diffs.every(d => d > 0) || diffs.every(d => d < 0);
  const validDiffs = diffs.every(d => Math.abs(d) >= 1 && Math.abs(d) <= 3);
  return isMonotonic && validDiffs;
};

const canBeMadeSafe = (seq: Sequence): boolean => {
  return seq.some((_, i) => 
    isSafe([...seq.slice(0, i), ...seq.slice(i + 1)])
  );
};

const pt1 = (input: string): number => {
  const sequences = parseInput(input);
  return sequences.filter(isSafe).length;
};

const pt2 = (input: string): number => {
  const sequences = parseInput(input);
  return sequences.filter(seq => isSafe(seq) || canBeMadeSafe(seq)).length;
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
