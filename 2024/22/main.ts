const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

const generateNextSecret = (secret: number): number => {
  let result = secret;
  result = (result ^ (result * 64)) & 0xFFFFFF;
  result = (result ^ Math.floor(result / 32)) & 0xFFFFFF;
  result = (result ^ (result * 2048)) & 0xFFFFFF;
  return result;
};

const parseInput = (input: string): number[] => {
  return input.trim().split("\n").map(Number);
};

const processSecretNumbers = (inp: number[]): [number, number] => {
  const full = new Map<string, number>();
  const p1: number[] = [];

  for (const num of inp) {
    const seen = new Set<string>();
    const nums: number[] = [num];
    let prev = num;

    for (let i = 0; i < 2000; i++) {
      prev = generateNextSecret(prev);
      nums.push(prev % 10);
    }

    p1.push(prev);

    const changes = nums.slice(1).map((n, i) => [n - nums[i], n] as [number, number]);

    for (let i = 0; i < changes.length - 3; i++) {
      const key = `${changes[i][0]},${changes[i+1][0]},${changes[i+2][0]},${changes[i+3][0]}`;
      if (!seen.has(key)) {
        seen.add(key);
        const currentValue = full.get(key) || 0;
        full.set(key, currentValue + changes[i+3][1]);
      }
    }
  }

  const p2 = Math.max(...full.values());
  return [p1.reduce((a, b) => a + b, 0), p2];
};

const pt1 = (input: string): number => {
  const numbers = parseInput(input);
  return processSecretNumbers(numbers)[0];
};

const pt2 = (input: string): number => {
  const numbers = parseInput(input);
  return processSecretNumbers(numbers)[1];
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
