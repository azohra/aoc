const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type ClawMachine = {
  buttonA: { x: number; y: number };
  buttonB: { x: number; y: number };
  prize: { x: bigint; y: bigint };
};

const parseInput = (input: string, part2 = false): ClawMachine[] => {
  const machines: ClawMachine[] = [];
  const offset = part2 ? 10000000000000n : 0n;
  
  for (const group of input.trim().split('\n\n')) {
    const [buttonA, buttonB, prize] = group.split('\n');
    
    const [aX, aY] = buttonA.match(/X\+(\d+), Y\+(\d+)/)!.slice(1).map(Number);
    const [bX, bY] = buttonB.match(/X\+(\d+), Y\+(\d+)/)!.slice(1).map(Number);
    const [pX, pY] = prize.match(/X=(\d+), Y=(\d+)/)!.slice(1).map(n => BigInt(n) + offset);
    
    machines.push({
      buttonA: { x: aX, y: aY },
      buttonB: { x: bX, y: bY },
      prize: { x: pX, y: pY }
    });
  }
  
  return machines;
};

const findSolution = (machine: ClawMachine): [bigint, bigint] | null => {
  const { buttonA, buttonB, prize } = machine;
  
  const det = buttonA.x * buttonB.y - buttonA.y * buttonB.x;
  if (det === 0) return null;
  
  const detBig = BigInt(det);
  const bAx = BigInt(buttonA.x);
  const bAy = BigInt(buttonA.y);
  const bBx = BigInt(buttonB.x);
  const bBy = BigInt(buttonB.y);
  
  const pressA = (prize.x * bBy - prize.y * bBx) / detBig;
  const pressB = (bAx * prize.y - bAy * prize.x) / detBig;
  
  if ((prize.x * bBy - prize.y * bBx) % detBig !== 0n ||
      (bAx * prize.y - bAy * prize.x) % detBig !== 0n) {
    return null;
  }
  
  if (pressA < 0n || pressB < 0n) return null;
  
  return [pressA, pressB];
};

const solve = (machines: ClawMachine[]): [bigint, number] => {
  let totalTokens = 0n;
  let winnable = 0;
  
  for (const machine of machines) {
    const solution = findSolution(machine);
    if (solution) {
      winnable++;
      const [pressA, pressB] = solution;
      totalTokens += pressA * 3n + pressB;
    }
  }
  
  return [totalTokens, winnable];
};

const pt1 = (input: string): bigint => {
  const machines = parseInput(input);
  const [tokens, winnable] = solve(machines);
  console.log(`Winnable prizes (P1): ${winnable}`);
  return tokens;
};

const pt2 = (input: string): bigint => {
  const machines = parseInput(input, true);
  const [tokens, winnable] = solve(machines);
  console.log(`Winnable prizes (P2): ${winnable}`);
  return tokens;
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
