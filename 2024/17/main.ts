const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Program = number[];
type Registers = [bigint, bigint, bigint];

type ProgramState = {
  registers: Registers;
  ip: number;
  output: number[];
};

const parseInput = (input: string): [Program, Registers] => {
  const lines = input.trim().split("\n");
  
  // Parse registers
  const registers: Registers = [
    BigInt(lines[0].split(": ")[1]),
    BigInt(lines[1].split(": ")[1]),
    BigInt(lines[2].split(": ")[1])
  ];
  
  // Parse program
  const programLine = lines[4].split(": ")[1].trim();
  const program = programLine.split(",").map(s => parseInt(s.trim()));
  
  return [program, registers];
};

const getComboValue = (operand: number, registers: Registers): bigint => {
  if (operand <= 3) return BigInt(operand);
  return registers[operand - 4];
};

const executeProgram = (program: Program, initialRegisters: Registers): number[] => {
  const state: ProgramState = {
    registers: [...initialRegisters],
    ip: 0,
    output: []
  };

  while (state.ip < program.length - 1) {
    const opcode = program[state.ip];
    const operand = program[state.ip + 1];

    switch (opcode) {
      case 0: 
        state.registers[0] = state.registers[0] / (1n << getComboValue(operand, state.registers));
        break;
      case 1: 
        state.registers[1] ^= BigInt(operand);
        break;
      case 2: 
        state.registers[1] = getComboValue(operand, state.registers) % 8n;
        break;
      case 3: 
        if (state.registers[0] !== 0n) {
          state.ip = operand;
          continue;
        }
        break;
      case 4: 
        state.registers[1] ^= state.registers[2];
        break;
      case 5: 
        state.output.push(Number(getComboValue(operand, state.registers) % 8n));
        break;
      case 6: 
        state.registers[1] = state.registers[0] / (1n << getComboValue(operand, state.registers));
        break;
      case 7: 
        state.registers[2] = state.registers[0] / (1n << getComboValue(operand, state.registers));
        break;
    }

    state.ip += 2;
  }

  return state.output;
};

const findMinimumSolution = (program: Program): bigint => {
  let possibleNumsPrev = new Set<bigint>([0n]);
  const bCRegs: [bigint, bigint] = [0n, 0n];  // B and C registers are initialized to 0

  for (let n = 0; n < program.length; n++) {
    const possibleNums = new Set<bigint>();
    console.log(`Step ${n}, possible numbers: ${possibleNumsPrev.size}`);

    for (const j of possibleNumsPrev) {
      const baseNum = j * 8n;
      for (let k = 0; k < 8; k++) {
        const testNum = baseNum + BigInt(k);
        const output = executeProgram(program, [testNum, ...bCRegs]);
        if (output.slice(-n-1).join(',') === program.slice(-n-1).join(',')) {
          possibleNums.add(testNum);
        }
      }
    }

    if (possibleNums.size === 0) {
      console.log(`No possible numbers found at step ${n}`);
      return -1n;
    }

    possibleNumsPrev = possibleNums;
  }

  return Array.from(possibleNumsPrev).reduce((min, num) => 
    min === -1n || num < min ? num : min, -1n);
};

const pt1 = (input: string): string => {
  const [program, registers] = parseInput(input);
  return executeProgram(program, registers).join(",");
};

const pt2 = (input: string): bigint => {
  const [program] = parseInput(input);
  const solution = findMinimumSolution(program);
  
  if (solution !== -1n) {
    // Verify solution
    const verificationOutput = executeProgram(program, [solution, 0n, 0n]);
    console.log("\nVerification:");
    console.log("Got:", verificationOutput.join(","));
    console.log("Want:", program.join(","));
  }
  
  return solution;
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
