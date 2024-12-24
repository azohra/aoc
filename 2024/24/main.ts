const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Gate = [string, string, string, string]

const parseInput = (input: string): [Map<string, number>, Gate[]] => {
  const [inputsStr, gatesStr] = input.split("\n\n");
  const inputs = new Map(inputsStr.split("\n").map(line => {
    const [name, val] = line.split(": ");
    return [name, parseInt(val)];
  }));
  const gates: Gate[] = gatesStr.split("\n").map(line => {
    const [, x1, op, x2, res] = line.match(/(\w+) ([XORAND]+) (\w+) -> (\w+)/)!;
    return [x1, op, x2, res];
  });
  return [inputs, gates];
};

const furthestMade = (gates: Gate[]): [number, Set<string>] => {
  const ops = new Map(gates.map(([x1, op, x2, res]) => [`${[x1, x2].sort().join(",")}:${op}`, res]));
  const getRes = (x1: string, x2: string, op: string) => ops.get(`${[x1, x2].sort().join(",")}:${op}`);
  const carries: Record<number, string> = {};
  const correct = new Set<string>();
  let prevIntermediates = new Set<string>();

  for (let i = 0; i < 45; i++) {
    const pos = i.toString().padStart(2, "0");
    const predigit = getRes(`x${pos}`, `y${pos}`, "XOR");
    const precarry1 = getRes(`x${pos}`, `y${pos}`, "AND");

    if (i === 0) {
      if (predigit !== "z00") return [0, correct];
      carries[i] = precarry1!;
      continue;
    }

    const digit = getRes(carries[i - 1], predigit!, "XOR");
    if (digit !== `z${pos}`) return [i - 1, correct];

    correct.add(carries[i - 1]).add(predigit!);
    prevIntermediates.forEach(wire => correct.add(wire));

    const precarry2 = getRes(carries[i - 1], predigit!, "AND");
    carries[i] = getRes(precarry1!, precarry2!, "OR")!;
    prevIntermediates = new Set([precarry1!, precarry2!]);
  }

  return [45, correct];
};

const findSwaps = (gates: Gate[]): Set<[string, string]> => {
  const swaps = new Set<[string, string]>();
  let [base, baseUsed] = furthestMade(gates);

  for (let _ = 0; _ < 4; _++) {
    for (let i = 0; i < gates.length; i++) {
      for (let j = i + 1; j < gates.length; j++) {
        const [x1_i, op_i, x2_i, res_i] = gates[i];
        const [x1_j, op_j, x2_j, res_j] = gates[j];

        if (res_i === "z00" || res_j === "z00" || baseUsed.has(res_i) || baseUsed.has(res_j)) continue;

        [gates[i], gates[j]] = [[x1_i, op_i, x2_i, res_j], [x1_j, op_j, x2_j, res_i]];

        const [attempt, attemptUsed] = furthestMade(gates);
        if (attempt > base) {
          swaps.add([res_i, res_j]);
          [base, baseUsed] = [attempt, attemptUsed];
          break;
        }

        [gates[i], gates[j]] = [[x1_i, op_i, x2_i, res_i], [x1_j, op_j, x2_j, res_j]];
      }
      if (swaps.size === 4) break;
    }
    if (swaps.size === 4) break;
  }

  return swaps;
};

const pt1 = (input: string): bigint => {
  const [inputs, gates] = parseInput(input);
  const finished = new Map(inputs);

  for (const [x1, op, x2, res] of gates) {
    const v1 = finished.get(x1)!;
    const v2 = finished.get(x2)!;
    const val = op === "XOR" ? v1 ^ v2 : op === "OR" ? v1 | v2 : v1 & v2;
    finished.set(res, val);
  }

  const binStr = Array.from(finished)
    .filter(([key]) => key.startsWith("z"))
    .sort(([a], [b]) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
    .map(([, val]) => val)
    .join("");

  return BigInt(`0b${binStr}`);
};

const pt2 = (input: string): string => {
  const [, gates] = parseInput(input);
  const swaps = findSwaps(gates);
  return Array.from(swaps).flat().sort().join(",");
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
