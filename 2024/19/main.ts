const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

const parseInput = (input: string): { patterns: string[], designs: string[] } => {
  const [patternsStr, designsStr] = input.trim().split('\n\n');
  const patterns = patternsStr.split(', ');
  const designs = designsStr.split('\n');
  return { patterns, designs };
}

const isDesignPossible = (design: string, patterns: string[]): boolean => {
  if (design.length === 0) return true;
  for (const pattern of patterns) {
    if (design.startsWith(pattern)) {
      if (isDesignPossible(design.slice(pattern.length), patterns)) {
        return true;
      }
    }
  }
  return false;
}

const countWaysToBuild = (design: string, patterns: string[], memo: Map<string, number> = new Map()): number => {
  if (design.length === 0) return 1;
  if (memo.has(design)) return memo.get(design)!;
  
  let totalWays = 0;
  for (const pattern of patterns) {
    if (design.startsWith(pattern)) {
      totalWays += countWaysToBuild(design.slice(pattern.length), patterns, memo);
    }
  }
  memo.set(design, totalWays);
  return totalWays;
}

const pt1 = (input: string): number => {
  const { patterns, designs } = parseInput(input);
  return designs.filter(design => isDesignPossible(design, patterns)).length;
};

const pt2 = (input: string): number => {
  const { patterns, designs } = parseInput(input);
  return designs.reduce((sum, design) => sum + countWaysToBuild(design, patterns), 0);
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
