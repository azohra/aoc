const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Direction = '^' | 'A' | '<' | 'v' | '>';
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A';

interface PathMap {
  [key: string]: {
    [key: string]: string;
  };
}

const DIRECTION_PATHS: PathMap = {
  '^': { '^': 'A', A: '>A', '<': 'v<A', v: 'vA', '>': 'v>A' },
  A: { '^': '<A', A: 'A', '<': 'v<<A', v: '<vA', '>': 'vA' },
  '<': { '^': '>^A', A: '>>^A', '<': 'A', v: '>A', '>': '>>A' },
  v: { '^': '^A', A: '^>A', '<': '<A', v: 'A', '>': '>A' },
  '>': { '^': '<^A', A: '^A', '<': '<<A', v: '<A', '>': 'A' }
} as const;

const DIGIT_PATHS: PathMap = {
  '7': { '7': 'A', '8': '>A', '9': '>>A', '4': 'vA', '5': 'v>A', '6': 'v>>A', '1': 'vvA', '2': 'vv>A', '3': 'vv>>A', '0': '>vvvA', A: '>>vvvA' },
  '8': { '7': '<A', '8': 'A', '9': '>A', '4': '<vA', '5': 'vA', '6': 'v>A', '1': '<vvA', '2': 'vvA', '3': 'vv>A', '0': 'vvvA', A: 'vvv>A' },
  '9': { '7': '<<A', '8': '<A', '9': 'A', '4': '<<vA', '5': '<vA', '6': 'vA', '1': '<<vvA', '2': '<vvA', '3': 'vvA', '0': '<vvvA', A: 'vvvA' },
  '4': { '7': '^A', '8': '^>A', '9': '^>>A', '4': 'A', '5': '>A', '6': '>>A', '1': 'vA', '2': 'v>A', '3': 'v>>A', '0': '>vvA', A: '>>vvA' },
  '5': { '7': '<^A', '8': '^A', '9': '^>A', '4': '<A', '5': 'A', '6': '>A', '1': '<vA', '2': 'vA', '3': 'v>A', '0': 'vvA', A: 'vv>A' },
  '6': { '7': '<<^A', '8': '<^A', '9': '^A', '4': '<<A', '5': '<A', '6': 'A', '1': '<<vA', '2': '<vA', '3': 'vA', '0': '<vvA', A: 'vvA' },
  '1': { '7': '^^A', '8': '^^>A', '9': '^^>>A', '4': '^A', '5': '^>A', '6': '^>>A', '1': 'A', '2': '>A', '3': '>>A', '0': '>vA', A: '>>vA' },
  '2': { '7': '<^^A', '8': '^^A', '9': '^^>A', '4': '<^A', '5': '^A', '6': '^>A', '1': '<A', '2': 'A', '3': '>A', '0': 'vA', A: 'v>A' },
  '3': { '7': '<<^^A', '8': '<^^A', '9': '^^A', '4': '<<^A', '5': '<^A', '6': '^A', '1': '<<A', '2': '<A', '3': 'A', '0': '<vA', A: 'vA' },
  '0': { '7': '^^^<A', '8': '^^^A', '9': '^^^>A', '4': '^^<A', '5': '^^A', '6': '^^>A', '1': '^<A', '2': '^A', '3': '^>A', '0': 'A', A: '>A' },
  A: { '7': '^^^<<A', '8': '<^^^A', '9': '^^^A', '4': '^^<<A', '5': '<^^A', '6': '^^A', '1': '^<<A', '2': '<^A', '3': '^A', '0': '<A', A: 'A' }
} as const;

const pathLengthCache = new Map<string, number>();

const parseInput = (input: string): string[] => input.trim().split('\n');

const getPathLength = (
  start: Direction,
  end: Direction,
  depth: number,
  maxDepth: number
): number => {
  const cacheKey = `${start}|${end}|${depth}|${maxDepth}`;
  if (pathLengthCache.has(cacheKey)) return pathLengthCache.get(cacheKey)!;

  const path = DIRECTION_PATHS[start][end];
  if (depth === maxDepth) return path.length;

  const newStart: Direction = 'A';
  const total = [...path].reduce(
    (sum, newEnd) => sum + getPathLength(newStart, newEnd as Direction, depth + 1, maxDepth),
    0
  );

  pathLengthCache.set(cacheKey, total);
  return total;
};

const getDirectionSequenceForCode = (code: string): string => {
  let start: Digit = 'A';
  return [...code].reduce(
    (sequence, end) => sequence + DIGIT_PATHS[start][(start = end as Digit)],
    ''
  );
};

const calculateComplexity = (code: string, maxDepth: number): number => {
  const sequence = getDirectionSequenceForCode(code);
  const start: Direction = 'A';
  return [...sequence].reduce(
    (total, end) => total + getPathLength(start, end as Direction, 1, maxDepth),
    0
  );
};

const sumComplexities = (codes: string[], maxDepth: number): number => {
  return codes.reduce(
    (total, code) => total + calculateComplexity(code, maxDepth) * parseInt(code),
    0
  );
};

const pt1 = (input: string): number => {
  const codes = parseInput(input);
  return sumComplexities(codes, 2);
};

const pt2 = (input: string): number => {
  const codes = parseInput(input);
  return sumComplexities(codes, 25);
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input))
  console.log("Answer (P2):", pt2(input))
}
