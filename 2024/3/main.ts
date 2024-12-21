const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url))

type Instruction = 
  | { type: 'mul'; num1: number; num2: number }
  | { type: 'do' | 'dont' };

const parseInput = (input: string): Instruction[] => {
  const pattern = /mul\((\d{1,3}),(\d{1,3})\)|do\(\)|don't\(\)/g;
  const instructions: Instruction[] = [];
  let match;

  while ((match = pattern.exec(input)) !== null) {
    if (match[0] === 'do()') {
      instructions.push({ type: 'do' });
    } else if (match[0] === "don't()") {
      instructions.push({ type: 'dont' });
    } else if (match[1] && match[2]) {
      const num1 = parseInt(match[1], 10);
      const num2 = parseInt(match[2], 10);
      if (num1 >= 1 && num1 <= 999 && num2 >= 1 && num2 <= 999) {
        instructions.push({ type: 'mul', num1, num2 });
      }
    }
  }
  
  return instructions;
};

const calculateMulOnly = (instructions: Instruction[]): number =>
  instructions.reduce((sum, instr) => 
    instr.type === 'mul' ? sum + instr.num1 * instr.num2 : sum, 0);

const calculateWithEnabled = (instructions: Instruction[]): number => {
  let enabled = true;
  return instructions.reduce((sum, instr) => {
    switch (instr.type) {
      case 'do': enabled = true; break;
      case 'dont': enabled = false; break;
      case 'mul': return enabled ? sum + instr.num1 * instr.num2 : sum;
    }
    return sum;
  }, 0);
};

const pt1 = (input: string): number => {
  const instructions = parseInput(input);
  return calculateMulOnly(instructions);
};

const pt2 = (input: string): number => {
  const instructions = parseInput(input);
  return calculateWithEnabled(instructions);
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
