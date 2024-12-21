const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type NumberPair = [number, number];

const parseInput = (input: string): NumberPair[] => {
  return input.trim().split("\n").map(line => {
    const [left, right] = line.trim().split(/\s+/).map(Number);
    return [left, right];
  });
};

const countOccurrences = (numbers: number[]): Map<number, number> => {
  return numbers.reduce((acc, num) => {
    acc.set(num, (acc.get(num) || 0) + 1);
    return acc;
  }, new Map<number, number>());
};

function pt1(input: string): number {
  const pairs = parseInput(input);
  const left = pairs.map(pair => pair[0]).sort((a, b) => a - b);
  const right = pairs.map(pair => pair[1]).sort((a, b) => a - b);

  return left.reduce((acc, val, idx) => acc + Math.abs(val - right[idx]), 0);
}

function pt2(input: string): number {
  const pairs = parseInput(input);
  const left = pairs.map(pair => pair[0]);
  const right = pairs.map(pair => pair[1]);

  const rightCounts = countOccurrences(right);

  return left.reduce((acc, num) => acc + num * (rightCounts.get(num) || 0), 0);
}

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
};